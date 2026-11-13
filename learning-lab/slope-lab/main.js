// Standalone page: mount the lab with its defaults (progress kept in this
// browser, no account). A host app would call mount() itself with options.
import { mount } from './slope-lab.js';

mount(document.getElementById('slope-lab'));
