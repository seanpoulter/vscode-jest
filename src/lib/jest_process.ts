'use strict';

import {ChildProcess, spawn} from 'child_process';
import {ProjectWorkspace} from './project_workspace';

/**
 * Spawns and returns a Jest process with specific args 
 * 
 * @param {string[]} args
 * @returns {ChildProcess}
 */

export function jestChildProcessWithArgs(workspace: ProjectWorkspace, args: string[]) : ChildProcess {
        // A command could look like `npm run test`, which we cannot use as a command
        // as they can only be the first command, so take out the command, and add
        // any other bits into the args
        const runtimeExecutable = workspace.pathToJest;
        const [command, ...initialArgs] = runtimeExecutable.split(" ");
        const runtimeArgs = [...initialArgs, ...args];
        
        // To use our own commands in create-react, we need to tell the command that we're in a CI
        // environment, or it will always append --watch
        const env = process.env;
        env["CI"] = true;

        return spawn(command, runtimeArgs,  {cwd: workspace.rootPath, env: env});
    }