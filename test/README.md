# Testing

## Visual regression testing

Before you start, install CasperJS and PhantomJS globally:
```sh
npm install casperjs phantomjs
```
(Also add this task to any scripts ran on a build server).

## Implementation
If you’re implementing tests in a project for the first time, run:
```sh
gulp genConfig
```
then edit `backstop.json` file produced in the root of your project.

### Test commands:
Refresh the config file after changes:
```sh
gulp bless
```

Create new reference screenshots for tests:
```sh
gulp reference
```

Run the tests:
```sh
gulp visualTest
```

Open the visual report at `http://localhost:3001/compare`:
```sh
gulp openReport
```

## Reporting
By default the tests run and show errors in the command line. To change this, update `"report"` in `backstop.json` to include CLI:
```json
"report": ["CLI", "browser"],
```

For further instructions see the [Backstop documentation](https://github.com/garris/BackstopJS).
