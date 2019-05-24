var assert = require('assert');

describe('Homepage behaviour', function() {

  beforeAll(() => {
    browser
      .url('/')
      .pause(5000)
  });

  it('should fail', () => {
    expect(true).toBeFalsy();
  })

  it('has title', function () {
    expect(browser.getTitle()).toBe("Street Support Network - Working together to end homelessness");
  });

  it('has Find Help CTA', function () {
    var findHelpCTA = browser.element('.btn--brand-d=Find Help');
    expect(findHelpCTA).not.toBeNull();
  });

  it('has Give Help CTA', function () {
    var giveHelpCTA = browser.element('.btn--brand-e=Give Help');
    expect(giveHelpCTA).not.toBeNull();
  });
});
