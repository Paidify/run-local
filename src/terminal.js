/**
 * IMPORTANT
 * This file is an implementation of https://github.com/miguelmota/terminal-tab.
 * All credits to the original author, Miguel Mota (https://github.com/miguelmota).
 * The original code is licensed under the MIT License.
 *
 * The original code was modified to work with the current project. Why? Because the original code causes Node to exit before running the whole program.
 */

import os from "os";
import child_process from "child_process";

const platform = getPlatform();

const cache = {
    isgnome: null,
    isxterm: null,
    isxtermemulator: null
};

const isGnome = () => {
    if (cache.isgnome !== null) {
        return cache.isgnome;
    }

    try {
        child_process.execSync("which gnome-terminal");
        cache.isgnome = true;
    } catch (e) {
        cache.isgnome = false;
    }

    return cache.isgnome;
};

const isXterm = () => {
    if (cache.isxterm !== null) {
        return cache.isxterm;
    }

    try {
        child_process.execSync("which xterm");
        cache.isxterm = true;
    } catch (e) {
        cache.isxterm = false;
    }

    return cache.isxterm;
};

const isXtermEmulator = () => {
    if (cache.isxtermemulator !== null) {
        return cache.isxtermemulator;
    }

    try {
        child_process.execSync("which x-terminal-emulator");
        cache.isxtermemulator = true;
    } catch (e) {
        cache.isxtermemulator = false;
    }

    return cache.isxtermemulator;
};

const open = {
    mac: (cmd, title) =>
        [
            `osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down' `,
            `-e 'tell application "Terminal" to do script `,
            `"${cmd.replace(/"/g, '\\"')}" `,
            `in selected tab of the front window'`
        ].join(""),
    linux: (cmd, title) => {
        if (isGnome()) {
            return `gnome-terminal ${
                title ? `--title="${title}"` : ""
            } -e 'bash -c "${cmd};exec bash"'`;
        } else if (isXterm()) {
            return `xterm ${
                title ? `-T "${title}" -n "${title}"` : ""
            } -e 'bash -c "${cmd};exec bash"'`;
        } else if (isXtermEmulator()) {
            return `x-terminal-emulator -e 'bash -c "${cmd};exec bash"'`;
        }

        return "";
    },
    win: (cmd, title) =>
        `start cmd.exe /K "${title ? `title ${title} &&` : ""} ${cmd}"`
};

function getPlatform() {
    switch (os.platform()) {
        case "darwin":
            return "mac";
        case "win32":
            return "win";
        default:
            return "linux";
    }
}

const defaultConfig = {
    onStdout: () => {},
    onStderr: () => {},
    onError: () => {},
    onExit: () => {}
};

export function openTerminal(
    cmd,
    title,
    option = {},
    cbOrConfig = defaultConfig
) {
    let child;

    if (typeof cbOrConfig === "object" && cbOrConfig !== null) {
        cbOrConfig = Object.assign({}, defaultConfig, cbOrConfig);
    } else if (typeof cbOrConfig === "function") {
        cbOrConfig = Object.assign({}, defaultConfig, {
            onStdout: cbOrConfig
        });
    }

    child = child_process.exec(
        open[platform](cmd, title),
        option,
        (error, stdout, stderr) => {
            if (error) {
                cbOrConfig.onError(error);
                return;
            }

            cbOrConfig.onStdout(stdout);
            cbOrConfig.onStderr(stderr);
        }
    );

    child.on("close", (code, signal) => {
        // The 'close' event is emitted when the stdio streams of a child process have been closed. This is distinct from the 'exit' event, since multiple processes might share the same stdio streams.
        cbOrConfig.onExit(code, signal);
    });

    return child;
}
