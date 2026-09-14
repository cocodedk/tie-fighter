import assert from 'node:assert/strict';

export default class TestCountReporter {
  onBegin(_config, suite) {
    this.tests = suite.allTests();
  }

  onEnd(result) {
    try {
      assert.equal(this.tests.length, 17, 'Expected exactly 17 gameplay and native WebMCP tests');
      assert.equal(result.status, 'passed', 'Every test must pass');
      for (const test of this.tests) {
        assert.equal(test.expectedStatus, 'passed', `${test.title}: expected failures are forbidden`);
        assert.equal(test.results.length, 1, `${test.title}: retries are forbidden`);
        assert.equal(test.results[0].status, 'passed', `${test.title}: skipped/failed tests are forbidden`);
      }
      console.log('Verified test count: 17 passed, 0 skipped, 0 retries.');
    } catch (error) {
      console.error(error.message);
      return { status: 'failed' };
    }
  }
}
