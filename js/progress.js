// Progress tracking shared by every learning game.
//
// A game calls MathleteProgress.recordQuestionAttempt({...}) each time a
// student submits an answer. If the student is signed in, the attempt is
// saved to their account; if not, nothing is saved, the game carries on
// as before, and a small "log in to save your progress" note appears once.
//
// What this file does NOT do: decide whose attempt it is. The database
// function record_attempt() (supabase/progress.sql) takes the student from
// the signed-in session and counts the attempt number itself, so nothing
// sent from here can save an attempt to someone else's account.
//
// Tracking never gets in a game's way: every function here returns
// straight away, never throws, and never rejects. Attempts wait in the
// browser (localStorage) until the server confirms them, so a dropped
// connection loses nothing, and each attempt carries its own id, so
// sending one twice saves it once.
//
// Load after js/supabase-config.js and js/auth.js. How to wire up a game:
// docs/PROGRESS-TRACKING.md.
(function () {
  'use strict';

  var QUEUE_KEY = 'mathlete-progress-queue';
  var NUDGE_KEY = 'mathlete-progress-nudged';
  var MAX_QUEUE = 300;
  var MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;   // matches the server's limit
  var RETRY_MIN_MS = 5000, RETRY_MAX_MS = 5 * 60 * 1000;

  var A = window.MathleteAuth;
  // Site root, worked out from this script's own address, so links work
  // from any folder depth.
  var ROOT = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/js\/progress\.js(\?.*)?$/, '') : '';
  })();

  function uuid() {
    var c = window.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var b = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(b);
    else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = [];
    for (var j = 0; j < 16; j++) h.push((b[j] + 0x100).toString(16).slice(1));
    return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-' + h.slice(6, 8).join('') + '-' +
           h.slice(8, 10).join('') + '-' + h.slice(10).join('');
  }

  // ---------- the waiting list ----------

  function readQueue() {
    try {
      var q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      return Array.isArray(q) ? q : [];
    } catch (e) { return []; }
  }

  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); return true; } catch (e) { return false; }
  }

  function removeFromQueue(id) {
    writeQueue(readQueue().filter(function (it) { return it.id !== id; }));
  }

  function inQueue(id) {
    return readQueue().some(function (it) { return it.id === id; });
  }

  // ---------- who is signed in ----------

  // Resolves to the signed-in user's id, or null. Reads the saved session
  // (no network). Used to label queued attempts; the server decides for real.
  function currentUserId() {
    if (!A || !A.configured || !A.hasStoredSession()) return Promise.resolve(null);
    return A.client().then(function (sb) {
      return sb.auth.getSession();
    }).then(function (res) {
      var s = res && res.data && res.data.session;
      return s && s.user ? s.user.id : null;
    }).catch(function () { return null; });
  }

  // ---------- sending ----------

  var flushing = null, retryTimer = null, retryDelay = RETRY_MIN_MS;

  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimeout(function () { retryTimer = null; flush(); }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS);
  }

  // 'saved', 'drop' (the server will never accept it) or 'retry'.
  function send(sb, it) {
    var call = it.kind === 'end'
      ? sb.rpc('end_game_session', { p_session_id: it.sessionId, p_completed: it.completed, p_metrics: it.metrics })
      : sb.rpc(it.kind === 'review' ? 'record_review_attempt' : 'record_attempt', it.params);
    return call.then(function (res) {
      if (!res.error) return 'saved';
      var status = res.status || 0;
      // No answer, a server fault, "slow down", or an expired login: keep it.
      if (!status || status >= 500 || status === 429 || status === 401) return 'retry';
      if (window.console) console.warn('[Mathlete] Progress not saved: ' + (res.error.message || status));
      return 'drop';
    }, function () { return 'retry'; });
  }

  // Sends everything waiting for the signed-in student, oldest first, one
  // at a time (order matters: it decides which try was "attempt 1").
  // Attempts made under a different login stay put until that student is
  // back; they are never sent under someone else's session.
  function flush() {
    // Already sending: wait for that pass, then send whatever was added
    // meanwhile (a worksheet check records many answers at once), unless
    // the pass failed and a retry is already booked.
    if (flushing) return flushing.then(function () { return retryTimer ? undefined : flush(); });
    flushing = currentUserId().then(function (uid) {
      var now = Date.now();
      var all = readQueue().filter(function (it) { return now - it.at < MAX_AGE_MS; });
      writeQueue(all);
      var mine = uid ? all.filter(function (it) { return it.uid === uid; }) : [];
      if (!mine.length) return;
      return A.client().then(function (sb) {
        function next(i) {
          if (i >= mine.length) { retryDelay = RETRY_MIN_MS; return; }
          return send(sb, mine[i]).then(function (outcome) {
            if (outcome === 'retry') { scheduleRetry(); return; }
            removeFromQueue(mine[i].id);
            return next(i + 1);
          });
        }
        return next(0);
      });
    }).catch(function () { scheduleRetry(); }).then(function () { flushing = null; });
    return flushing;
  }

  // ---------- "log in to save" note for visitors ----------

  function nudge() {
    if (api.showLoginNote === false || !A || !A.configured) return;
    try {
      if (sessionStorage.getItem(NUDGE_KEY)) return;
      sessionStorage.setItem(NUDGE_KEY, '1');
    } catch (e) { return; }
    if (!document.body || document.getElementById('mathlete-progress-note')) return;

    var box = document.createElement('div');
    box.id = 'mathlete-progress-note';
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;' +
      'max-width:calc(100% - 32px);box-sizing:border-box;display:flex;gap:12px;align-items:center;' +
      'padding:10px 14px;border-radius:10px;background:#1d2220;color:#f4f1ea;' +
      'font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35)';
    var text = document.createElement('span');
    text.textContent = 'Have a Mathlete account? ';
    var link = document.createElement('a');
    link.textContent = 'Log in to save your progress';
    link.style.cssText = 'color:#ffb38a;text-decoration:underline';
    var here = '';
    try { here = top.location.href.slice(ROOT.length); } catch (e) {}
    var next = A.safeNext(here);
    link.href = ROOT + 'login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
    link.target = '_top';
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));
    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.style.cssText = 'border:0;background:none;color:inherit;font-size:20px;line-height:1;cursor:pointer;padding:0 2px';
    close.onclick = function () { box.remove(); };
    box.appendChild(text);
    box.appendChild(close);
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.remove(); }, 12000);
  }

  // ---------- what games call ----------

  function str(v) { return v === undefined || v === null ? null : String(v).slice(0, 1000); }
  function int(v) { v = Math.round(Number(v)); return isFinite(v) && v >= 0 ? v : null; }

  // Start a play session. Returns its id straight away; pass it as
  // gameSessionId with each attempt. Nothing is sent until the first
  // attempt is saved.
  function startSession() { return uuid(); }

  // Record one submitted answer. Resolves (never rejects) with
  //   { saved: true,  attemptId }               stored on the server
  //   { saved: false, queued: true, attemptId } waiting for a connection
  //   { saved: false, reason: 'anonymous' }     nobody is signed in
  //   { saved: false, reason: 'invalid' }       a required field is missing
  function recordQuestionAttempt(a) {
    try {
      a = a || {};
      if (!a.gameId || !a.questionId || typeof a.isCorrect !== 'boolean' ||
          !a.questionSnapshot || typeof a.questionSnapshot !== 'object') {
        if (window.console) console.warn('[Mathlete] recordQuestionAttempt needs gameId, questionId, questionSnapshot and isCorrect.');
        return Promise.resolve({ saved: false, reason: 'invalid' });
      }
      var ms = a.timeToAnswerMs !== undefined ? int(a.timeToAnswerMs)
             : a.timeToAnswer !== undefined ? int(Number(a.timeToAnswer) * 1000) : null;
      var item = {
        id: uuid(),
        kind: 'attempt',
        at: Date.now(),
        params: {
          p_game_id: String(a.gameId),
          p_question_id: String(a.questionId),
          // A plain copy, so later changes to the game's own object can't alter it.
          p_snapshot: JSON.parse(JSON.stringify(a.questionSnapshot)),
          p_is_correct: a.isCorrect,
          p_student_answer: str(a.studentAnswer),
          p_correct_answer: str(a.correctAnswer),
          p_hints_used: int(a.hintsUsed) || 0,
          p_time_ms: ms,
          p_session_id: a.gameSessionId || null,
          p_context: a.context || 'game',
          p_client_time: new Date().toISOString(),
          p_question_key: a.questionKey ? String(a.questionKey).slice(0, 200) : null
        }
      };
      item.params.p_attempt_id = item.id;

      return currentUserId().then(function (uid) {
        if (!uid) { nudge(); return { saved: false, reason: 'anonymous' }; }
        item.uid = uid;
        var q = readQueue();
        q.push(item);
        if (q.length > MAX_QUEUE) q = q.slice(q.length - MAX_QUEUE);
        var stored = writeQueue(q);
        if (!stored) {
          // No localStorage (private window, full disk): send it once, directly.
          return A.client().then(function (sb) { return send(sb, item); }).then(function (outcome) {
            return { saved: outcome === 'saved', attemptId: item.id };
          });
        }
        return flush().then(function () {
          var waiting = inQueue(item.id);
          return { saved: !waiting, queued: waiting, attemptId: item.id };
        });
      }).catch(function () { return { saved: false, reason: 'error' }; });
    } catch (e) {
      return Promise.resolve({ saved: false, reason: 'error' });
    }
  }

  // Record a try at a saved question from the review page (review.html).
  // Only the review item, the answer and whether it was right are sent:
  // the server looks up the question itself from the student's original
  // attempt. Resolves like recordQuestionAttempt.
  function recordReviewAttempt(a) {
    try {
      a = a || {};
      if (!a.reviewItemId || typeof a.isCorrect !== 'boolean') return Promise.resolve({ saved: false, reason: 'invalid' });
      var item = {
        id: uuid(), kind: 'review', at: Date.now(),
        params: {
          p_review_item_id: a.reviewItemId,
          p_is_correct: a.isCorrect,
          p_student_answer: str(a.studentAnswer),
          p_hints_used: int(a.hintsUsed) || 0,
          p_time_ms: a.timeToAnswerMs !== undefined ? int(a.timeToAnswerMs) : null
        }
      };
      item.params.p_attempt_id = item.id;
      return currentUserId().then(function (uid) {
        if (!uid) return { saved: false, reason: 'anonymous' };
        item.uid = uid;
        var q = readQueue();
        q.push(item);
        if (!writeQueue(q)) {
          return A.client().then(function (sb) { return send(sb, item); }).then(function (outcome) {
            return { saved: outcome === 'saved', attemptId: item.id };
          });
        }
        return flush().then(function () {
          var waiting = inQueue(item.id);
          return { saved: !waiting, queued: waiting, attemptId: item.id };
        });
      }).catch(function () { return { saved: false, reason: 'error' }; });
    } catch (e) {
      return Promise.resolve({ saved: false, reason: 'error' });
    }
  }

  // Mark a session finished (optional). metrics: a small object, e.g. { score: 8 }.
  function endSession(sessionId, opts) {
    try {
      if (!sessionId) return Promise.resolve({ saved: false, reason: 'invalid' });
      opts = opts || {};
      var item = {
        id: uuid(), kind: 'end', at: Date.now(), sessionId: sessionId,
        completed: opts.completed !== false,
        metrics: opts.metrics ? JSON.parse(JSON.stringify(opts.metrics)) : null
      };
      return currentUserId().then(function (uid) {
        if (!uid) return { saved: false, reason: 'anonymous' };
        item.uid = uid;
        var q = readQueue();
        q.push(item);
        writeQueue(q);
        return flush().then(function () { return { saved: !inQueue(item.id) }; });
      }).catch(function () { return { saved: false, reason: 'error' }; });
    } catch (e) {
      return Promise.resolve({ saved: false, reason: 'error' });
    }
  }

  var api = {
    startSession: startSession,
    recordQuestionAttempt: recordQuestionAttempt,
    recordReviewAttempt: recordReviewAttempt,
    endSession: endSession,
    flush: flush,
    showLoginNote: true
  };
  window.MathleteProgress = api;

  // Send anything left over from last time, and again when the
  // connection or the tab comes back.
  if (A && A.configured && A.hasStoredSession() && readQueue().length) flush();
  window.addEventListener('online', function () { flush(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && readQueue().length) flush();
  });
})();
