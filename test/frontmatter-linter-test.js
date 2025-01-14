const expect = require('chai').expect;
const FrontmatterLinter = require('../lib/frontmatter-linter');

const defaultMetadataMarkdown = `---
stage: proposed
start-date: 
release-date: Unreleased
release-versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
teams: 
prs: 
  accepted: 
---`;

const emptyMetadata = `---
---`;

const nonExistentStageMarkdown = `---
stage: propsed
start-date: 2020-01-01 
release-date: Unreleased
release-versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
teams: 
  - framework
prs: 
  accepted: https://github.com/emberjs/rfcs/pull/123
---`;

const missingReleaseDataMarkdown = `---
stage: recommended
start-date: 2020-01-01
release-date: Unreleased
release-versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
teams: 
  - framework
prs:
  accepted: https://github.com/emberjs/rfcs/pull/123/
---`;

const completedMetadataMarkdown = `---
stage: recommended
start-date: 2020-01-01 
release-date: 2020-04-02 
release-versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
teams: 
  - framework
prs:
  accepted: https://github.com/emberjs/rfcs/pull/123
---`;

const wrongURLForRFCMetadataMarkdown = `---
stage: recommended
start-date: 2020-01-01 
release-date: 2020-04-02 
release-versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
teams: 
  - framework
prs: 
  accepted: https://github.com/emberjs/rfcs/pull/123/files
---`;

const cliUrlForRFCMetadataMarkdown = `---
stage: recommended
start-date: 2020-01-01 
release-date: 2020-04-02 
release-versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
teams: 
  - framework
prs: 
  accepted: https://github.com/ember-cli/rfcs/pull/123
---`;

let linter;

describe('FrontmatterLinter', function () {
  beforeEach(function () {
    linter = new FrontmatterLinter(
      ['proposed', 'exploring', 'accepted', 'ready-for-release', 'released', 'recommended'],
      ['framework']
    );
  });

  it('reports errors for empty frontmatter/metadata', function () {
    let errorsForMissingMetadata = [
      'stage is required',
      'start-date is required',
      'teams is required',
      'prs is required',
    ];

    let linter = new FrontmatterLinter();
    let results = linter.lint('');
    expect(results.messages).to.deep.eql(errorsForMissingMetadata);

    results = linter.lint(emptyMetadata);
    expect(results.messages).to.deep.eql(errorsForMissingMetadata);
  });

  it('reports errors for default metadata', function () {
    let results = linter.lint(defaultMetadataMarkdown);

    expect(results.messages).to.deep.eql([
      'prs.accepted must be the URL for the original pull request on emberjs/rfcs, for example: https://github.com/emberjs/rfcs/pull/123',
      'start-date must be a date formatted YYYY-MM-DD',
      'teams must be a list of one or more Ember teams',
    ]);
  });

  it('reports errors for non-existent stage', function () {
    let results = linter.lint(nonExistentStageMarkdown);

    expect(results.messages).to.deep.eql([
      `stage must be one of the RFC Stages: "proposed", "exploring", "accepted", "ready-for-release", "released", "recommended" (See https://github.com/emberjs/rfcs#stages)`,
    ]);
  });

  it('reports errors for Release metadata when released', function () {
    let results = linter.lint(missingReleaseDataMarkdown);

    expect(results.messages).to.deep.eql([
      'release-date must be a date formatted YYYY-MM-DD',
      'release-versions packages must each be set to the version in which the RFC work was released in that package (Should not be default vX.Y.Z, should be removed if irrelevant)',
    ]);
  });

  it('reports errors for incorrect RFC PR URL', function () {
    let results = linter.lint(wrongURLForRFCMetadataMarkdown);

    expect(results.messages).to.deep.eql([
      'prs.accepted must be the URL for the original pull request on emberjs/rfcs, for example: https://github.com/emberjs/rfcs/pull/123',
    ]);
  });

  it('reports NO errors for completed metadata', function () {
    let results = linter.lint(completedMetadataMarkdown);
    expect(results.messages).to.be.empty;
  });

  it('reports NO errors for completed metadata with CLI RFC URL', function () {
    let results = linter.lint(cliUrlForRFCMetadataMarkdown);
    expect(results.messages).to.be.empty;
  });
});
