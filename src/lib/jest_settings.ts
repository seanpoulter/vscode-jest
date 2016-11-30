'use strict';

import {ChildProcess} from 'child_process';
import {EventEmitter} from 'events';
import {EOL} from 'os';
import {ProjectWorkspace} from './project_workspace';
import {jestChildProcessWithArgs} from './jest_process';

// This class represents the the configuration of Jest's process
// we want to start with the defaults then override whatever they output
// the interface below can be used to show what we use, as currently the whole
// settings object will be in memory.

// Ideally anything you care about adding should have a default in the constructor
// see https://facebook.github.io/jest/docs/configuration.html for full deets

// For now, this is all we care about inside the config
interface JestConfigRepresentation {
  testRegex: string;
}

export class JestSettings extends EventEmitter {
    private debugprocess: ChildProcess;
    private workspace: ProjectWorkspace;
    
    settings: JestConfigRepresentation;
    jestVersionMajor: number | null;
    
    constructor(workspace: ProjectWorkspace) {
      super();
      this.workspace = workspace;

      // Defaults for a Jest project
      this.settings = {
        testRegex: "(/__tests__/.*|\\.(test|spec))\\.jsx?$"
      }; 
    }

    getConfig(completed: any) {
        // It'll want to run tests, we don't want that, so tell it to run tests
        // in a non-existant folder.
        const folderThatDoesntExist = "aaskdjfbsjdhbfdhjsfjh";
        this.debugprocess = jestChildProcessWithArgs(this.workspace, ["--debug", folderThatDoesntExist]);

        this.debugprocess.stdout.on('data', (data: Buffer) => {
            const string = data.toString();
            // We can give warnings to versions under 17 now
            if (string.includes("jest version =")) {
              const version = string.split("jest version =").pop().split(EOL)[0];
              this.jestVersionMajor = parseInt(version);
            }
            // Pull out the data for the config
            if (string.includes("config =")) {
              const jsonString = string.split("config =").pop().split("No tests found")[0];
              this.settings = JSON.parse(jsonString);
              completed();
            }
        });
    }
}