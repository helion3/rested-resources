var expect = require('chai').expect;
var IdentifiedResource = require('../index').IdentifiedResource;
var ResultsResource = require('../index').ResultsResource;
var Resource = require('../index').Resource;

class Projects extends ResultsResource {};
class Project extends IdentifiedResource {};

class Issues extends ResultsResource {};
class Issue extends IdentifiedResource {};

var projects = new Projects();
var project = new Project({ name: 'test' });

var existingProject = new Project({ projectId: 1 });
existingProject.nest(Issue);
existingProject.nest(Issues);

var issue = new existingProject.Issue({ title: 'a' });
var existingIssue = new existingProject.Issue({ issueId: 1 });

describe('ResultsResource', function() {
    it('exists', function() {
        expect(ResultsResource).to.be.a('function');
    });

    it('extends Resource', function() {
        expect(projects instanceof Resource).to.be.true;
    });

    describe('query() method', function() {
        it('exists', function() {
            expect(projects.query).to.be.a('function');
        });

        it('generates the correct url', function() {
            expect(projects.toUrl()).to.equal('/projects');
        });

        it('returns a promise', function() {
            expect(projects.query().then).to.be.a('function');
        });
    });
});

describe('IdentifiedResource', function() {
    it('exists', function() {
        expect(IdentifiedResource).to.be.a('function');
    });

    it('extends Resource', function() {
        expect(project instanceof Resource).to.be.true;
    });

    describe('save() method for a new record', function() {
        it('exists', function() {
            expect(project.save).to.be.a('function');
        });

        it('generates the correct URL', function() {
            expect(project.toUrl()).to.equal('/projects');
        });

        it('returns a promise', function() {
            expect(project.save().then).to.be.a('function');
        });
    });

    describe('save() method for a pre-identified record', function() {
        it('exists', function() {
            expect(existingProject.save).to.be.a('function');
        });

        it('generates the correct url', function() {
            expect(existingProject.toUrl()).to.equal('/projects/1');
        });

        it('returns a promise', function() {
            expect(existingProject.save().then).to.be.a('function');
        });
    });

    describe('delete() method', function() {
        it('exists', function() {
            expect(project.delete).to.be.a('function');
        });

        it('returns a promise', function() {
            expect(project.delete().then).to.be.a('function');
        });
    });

    describe('nest() method', function() {
        it('exists', function() {
            expect(existingProject.nest).to.be.a('function');
        });

        describe('nested ResultsResources', function() {
            it('nests', function() {
                expect(existingProject.issues).to.be.an('object');
            });

            it('generates the correct url', function() {
                expect(existingProject.issues.toUrl()).to.equal('/projects/1/issues');
            });
        });

        describe('nested IdentifiedResources', function() {
            it('nests', function() {
                expect(existingProject.Issue).to.be.a('function');
            });

            it('generates the correct url for a new record', function() {
                expect(issue.toUrl()).to.equal('/projects/1/issues');
            });

            it('generates the correct url for an existing record', function() {
                expect(existingIssue.toUrl()).to.equal('/projects/1/issues/1');
            });
        });
    });

    describe('baseUrl', function() {
        it('can be changed statically', function() {
            Resource.baseUrl = '/api/v1';

            expect(existingProject.toUrl()).to.equal('/api/v1/projects/1');
        })
    })
});
