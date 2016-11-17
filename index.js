var pluralize = require('pluralize');
var Promise = require('es6-promise');
var superagent = require('superagent');

function tokenReplacer(base, obj) {
    Object.keys(obj).forEach(function(k) {
        base = base.replace(':' + k, obj[k]);
    });

    return base;
}

/**
 * Base Resource class.
 */
var Resource = class Resource {
    constructor() {
        if (arguments.length === 1) {
            if (arguments[0] instanceof Resource) {
                this._parent = arguments[0];
            } else {
                this.body = arguments[0];
            }
        }

        if (arguments.length === 2) {
            this.body = arguments[0];

            if (arguments[1] instanceof Resource) {
                this._parent = arguments[1];
            }
        }

        this._name = this.constructor.name.toLowerCase();
        this._namePlural = pluralize(this._name);
        this._id = this._name + 'Id';
    }

    /**
     * Generate a URL for this resource.
     *
     * @return {string} Resource URL.
     */
    toUrl() {
        var url;

        // Append context URLs
        if (this._parent && typeof this._parent.toUrl === 'function') {
            url = this._parent.toUrl();
        } else {
            url = Resource.baseUrl;
        }

        // Append our own results resource
        url += '/' + this._namePlural;

        // Append identification if provided
        if (this.body && this.body[this._id]) {
            url = tokenReplacer(url + '/:' + this._id, this.body);
        }

        return url;
    }
};

Resource.baseUrl = '';

/**
 * A single resource that has, or will have an identification.
 */
class IdentifiedResource extends Resource {
    /**
     * Initiates a DELETE request to the indentified resource URL.
     */
    delete() {
        return new Promise((resolve, reject) => {
            superagent.delete(this.toUrl()).end((err, res) => {
                if (err) {
                    return reject(err);
                }

                resolve(res.body);
            });
        });
    }

    /**
     * Nests a Resource below this identified resource.
     *
     * Identified resources will become parent.Child.
     * Results resources will become parent.children.
     *
     * @param {Resource} NestedResource Resource to nest.
     */
    nest() {
        var resource = this;

        Array.prototype.slice.call(arguments).forEach((NestedResource) => {
            var name = NestedResource.name;
            var instance = new NestedResource(resource);

            if (instance instanceof IdentifiedResource) {
                resource[name] = function(data) {
                    return new NestedResource(data, resource);
                };
            } else {
                resource[pluralize(name.toLowerCase())] = instance;
            }
        });
    }

    /**
     * Initiates a POST request to:
     * - the results resource URL if no ID is present
     * - the indentified resource URL is ID present
     */
    save() {
        return new Promise((resolve, reject) => {
            superagent.post(this.toUrl()).send(this.body).end((err, res) => {
                if (err) {
                    return reject(err);
                }

                resolve(res.body);
            });
        });
    }
};

/**
 * A results resource.
 */
class ResultsResource extends Resource {
    /**
     * Queries records for this resource.
     */
    query() {
        return new Promise((resolve, reject) => {
            superagent.get(this.toUrl()).end((err, res) => {
                if (err) {
                    return reject(err);
                }

                resolve(res.body);
            });
        });
    }
};

module.exports = {
    IdentifiedResource: IdentifiedResource,
    Resource: Resource,
    ResultsResource: ResultsResource
};
