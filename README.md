# RESTed Resources

RESTed Resources is a client-side REST-based API layer for your resources. Conceptually similar to `ngResource`, it
handles http requests and URL building to give you simple, consistent logic.

Resources automatically generate URLs based on their hierarchy. Requests are managed by [superagent](https://github.com/visionmedia/superagent)
and results/errors are handled via Promises.

## Installation

- `npm install rested-resources --save`
- or for yarn users: `yarn add rested-resources`

## Usage

While RESTed Resources works as a client-side library, it's built as an NPM module with the assumption you're using
webpack or a related library to compile your application.

Examples below are written with some ES6, which will require babel to transpile.

Import the resource classes:

```js
import { IdentifiedResource, ResultsResource } from 'resource';
```

While you can export resource classes directly, you'll likely want to use a factory to help setup relationships.

```js
-- student.js
export default class Student extends IdentifiedResource {}

-- students.js
export default class Students extends ResultsResource {}

-- course.js:
import Student from './student';
import Students from './students';

class Course extends IdentifiedResource {}

export function(data) {
    let resource = new Course(data);

    resource.nest(Student);
    resource.nest(Students);

    return resource;
}
```

You now have everything needed to interact with these resources.

Querying for all students in a course:

```js
var course = new Course({ courseId: 'history-101' });

// performs: GET /courses/history-101/students
course.students.query().then((results) => {
    // results will be the resulting JSON
});
```

Query for a specific student's course data:

```js
var course = new Course({ courseId: 'history-101' });
var student = new course.Student({ studentId: 1234 });

// performs: GET /courses/history-101/students/1234
student.get().then((result) => {
    // result will be the resulting JSON
});
```

Create a new student record:

```js
var student = new Student({ name: 'Kermit' });

// performs: POST /students
student.save().then((result) => {});
```
