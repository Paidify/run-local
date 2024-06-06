import prompts from "prompts";
import openTerminal from "./openTerminal.js";
import fs from "fs";
import path from "path";
import { __dirname, repos } from "./constants.js";
import { spawn } from "child_process";

const DEF_REPOS_FOLDER = path.join(__dirname, "..");

run();

function run() {
    (async () => {
        console.log("======================================");
        console.log("=                                    =");
        console.log("=               Paidify              =");
        console.log("=                                    =");
        console.log("======================================");
        console.log();

        try {
            const reposFolder = await getReposFolder();
            const missingRepos = await getMissingRepos(reposFolder);

            if (missingRepos.length) {
                console.log("Missing repositories:");
                missingRepos.forEach((repo) => {
                    console.log(`- ${repo.title} (${repo.url})`);
                });
                console.log();

                const { clone } = await prompts({
                    type: "confirm",
                    name: "clone",
                    message:
                        "Confirm cloning missing repositories to continue (requires git installed):"
                });

                // const { clone } = await prompts({
                //     type: "toggle",
                //     name: "clone",
                //     initial: false,
                //     message:
                //         "Confirm cloning missing repositories to continue (requires git installed):",
                //     active: "yes",
                //     inactive: "no"
                // });

                if (!clone) {
                    throw new Error("Cloning cancelled by user");
                }

                await cloneRepos(missingRepos, reposFolder);
                console.log("Repositories cloned successfully");
                console.log();
            }

            repos.sort((a, b) => a.order - b.order);

            for (let i = 0; i < repos.length; i++) {
                const repo = repos[i];
                const { commands } = repo;

                if (commands.length) {
                    // if (commands.length > 1) {
                    repo.command = (
                        await prompts({
                            type: "select",
                            name: "command",
                            message: `(${i + 1}/${
                                repos.length
                            }) Select command to run for ${repo.title}:`,
                            choices: commands.map((command) => ({
                                title: command,
                                value: command
                            }))
                        })
                    ).command;
                }
            }

            console.log();

            for (let i = 0; i < repos.length; i++) {
                const repo = repos[i];
                const { title, command } = repo;

                await prompts({
                    type: "text",
                    name: "open",
                    message: `(${i + 1}/${
                        repos.length
                    })Press enter to start terminal for ${title}`,
                    initial: true
                });

                repo.childProcess = openTerminal(`echo ${title}`, {
                    cwd: path.join(reposFolder, title)
                });
            }

            console.log();
            console.log("Opening terminals for repositories...");
        } catch (err) {
            console.error(err);
        }

        setTimeout(async () => {
            await prompts({
                type: "text",
                name: "exit",
                message: "Press Enter to exit"
            });

            repos.forEach(({ childProcess }) => {
                if (childProcess) {
                    // console.log("Killing child process");
                    // childProcess.disconnect();
                    childProcess.kill();
                }
            });

            // process.exit(0);
        }, 2000);
    })();
}

async function getReposFolder() {
    let reposFolder;

    while (true) {
        reposFolder =
            (
                await prompts({
                    type: "text",
                    name: "value",
                    message: `Enter path to Paidify repositories reference folder (leave empty for default: ${DEF_REPOS_FOLDER}):`
                    // initial: DEF_REPOS_FOLDER,
                })
            ).value || DEF_REPOS_FOLDER;

        try {
            await fs.promises.access(
                reposFolder,
                fs.constants.O_DIRECTORY | fs.constants.W_OK | fs.constants.R_OK
            );
            break;
        } catch (err) {
            console.log("Invalid path. Please try again.");
        }
    }

    return reposFolder;
}

async function getMissingRepos(reposFolder) {
    const folders = await fs.promises.readdir(reposFolder);
    return repos.filter((repo) => !folders.includes(repo.title));
}

async function cloneRepos(repos, reposFolder) {
    // for (const repo of repos) {
    //     try {
    //         await cloneRepo(repo, reposFolder);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }
    await Promise.all(repos.map((repo) => cloneRepo(repo, reposFolder)));
}

function cloneRepo(repo, reposFolder) {
    return new Promise((res, rej) => {
        const { url, title } = repo;
        const cloneProcess = spawn(`cd ${reposFolder} && git clone ${url}`, {
            shell: true
        });

        // main process events

        cloneProcess.on("exit", () => {
            rej(
                new Error(`Error when cloning repository ${title} from ${url}`)
            );
        });

        cloneProcess.on("error", (err) => {
            rej(err);
        });

        // stdout events

        cloneProcess.stdout.on("end", () => {
            if (!fs.existsSync(path.join(reposFolder, title))) {
                return rej(
                    new Error(`Failed to clone repository ${title} from ${url}`)
                );
            }
            res();
        });

        // stderr events

        // cloneProcess.stderr.on("data", (data) => {
        //   console.log(`stderr data: ${data}`);
        // });

        cloneProcess.stderr.on("error", (err) => {
            // console.log(`stderr err: ${err}`);
            return rej(err);
        });
    });
}
