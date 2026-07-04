import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser's native Web Speech Synthesis API for StorytellingCard narration tests
class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.paused = false;
  }
  speak(utterance) {
    this.speaking = true;
    this.paused = false;
    // Simulate speech finishing by firing onend asynchronously
    setTimeout(() => {
      if (this.speaking && utterance.onend) {
        utterance.onend({ type: 'end' });
      }
      this.speaking = false;
    }, 100);
  }
  cancel() {
    this.speaking = false;
    this.paused = false;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
}

global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.onend = null;
    this.onerror = null;
  }
};

global.speechSynthesis = new MockSpeechSynthesis();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollIntoView since JSDOM does not implement layout models
window.HTMLElement.prototype.scrollIntoView = vi.fn();
