import prompts from "prompts";
import { openTerminal } from "./terminal.js";
import fs from "fs";
import path from "path";
import { services } from "./config.js";
import { __dirname } from "./constants.js";
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
            console.log();

            const missingRepos = await getMissingRepos(reposFolder);

            if (missingRepos.length) {
                console.log("Missing repositories:");
                missingRepos.forEach((repo) => {
                    console.log(`- ${repo.title} (${repo.repoUrl})`);
                });
                console.log();

                const { clone } = await prompts({
                    type: "toggle",
                    name: "clone",
                    initial: true,
                    message:
                        "Confirm cloning missing repositories to continue (requires git installed):",
                    active: "yes",
                    inactive: "no"
                });

                if (clone === undefined) {
                    throw new Error("Process cancelled by user");
                }

                console.log("Please wait...");
                await cloneRepos(missingRepos, reposFolder);
                console.log("Repositories cloned successfully!");
                console.log();
            }

            console.log("Configuring .env files for repositories...");
            await Promise.all(
                services
                    .filter(({ env }) => env)
                    .map(async ({ title, env }) => {
                        const pathEnvFile = path.join(
                            reposFolder,
                            title,
                            ".env"
                        );
                        await writeEnvFile(pathEnvFile, env);
                    })
            );
            console.log(".env files configured successfully!");
            console.log();

            services.sort((a, b) => a.order - b.order);

            console.log("Define commands for services:");

            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const { commands } = service;

                if (commands.length) {
                    const { command } = await prompts({
                        type: "text",
                        name: "command",
                        message: `(${i + 1}/${
                            services.length
                        }) Confirm command for ${service.title} service`,
                        initial: commands.join(" && ")
                    });

                    if (command === undefined) {
                        throw new Error("Process cancelled by user");
                    }

                    service.command = command;
                }
            }

            console.log();

            console.log("Starting services...");

            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const { title, command } = service;

                const { open } = await prompts({
                    type: "invisible",
                    name: "open",
                    message: `(${i + 1}/${
                        services.length
                    }) Press enter to start ${title} process`
                });

                if (open === undefined) {
                    throw new Error("Process cancelled by user");
                }

                service.childProcess = openTerminal(command, title, {
                    cwd: path.join(reposFolder, title)
                });
            }

            console.log();
            console.log("Opening terminals for services...");
        } catch (err) {
            console.log();
            console.error(err);
        }

        setTimeout(async () => {
            console.log();

            await prompts({
                type: "invisible",
                name: "exit",
                message:
                    "Job completed. Press enter to exit... (the other terminals will remain open)"
            });
        }, 2000);
    })();
}

async function getReposFolder() {
    let reposFolder;

    while (true) {
        reposFolder = (
            (
                await prompts({
                    type: "text",
                    name: "value",
                    message: `Enter path to Paidify repositories reference folder (leave empty for default: ${DEF_REPOS_FOLDER})`
                    // initial: DEF_REPOS_FOLDER,
                })
            ).value || DEF_REPOS_FOLDER
        ).replace(/\\/g, "/");
        console.log(reposFolder);

        try {
            await fs.promises.access(
                reposFolder,
                fs.constants.O_DIRECTORY | fs.constants.W_OK | fs.constants.R_OK
            );
            break;
        } catch (err) {
            console.log(err);
            console.log("Invalid path. Please try again.");
        }
    }

    return reposFolder;
}

async function getMissingRepos(reposFolder) {
    const folders = await fs.promises.readdir(reposFolder);
    return services.filter((repo) => !folders.includes(repo.title));
}

async function cloneRepos(repos, reposFolder) {
    await Promise.all(repos.map((repo) => cloneRepo(repo, reposFolder)));
}

function cloneRepo(repo, reposFolder) {
    return new Promise((res, rej) => {
        const { repoUrl, title } = repo;
        const cloneProcess = spawn(
            `cd ${reposFolder} && git clone ${repoUrl} ${title}`,
            { shell: true }
        );

        // main process events

        cloneProcess.on("exit", () => {
            rej(
                new Error(
                    `Error when cloning repository ${title} from ${repoUrl}`
                )
            );
        });

        cloneProcess.on("error", (err) => {
            rej(err);
        });

        // stdout events

        cloneProcess.stdout.on("end", () => {
            if (!fs.existsSync(path.join(reposFolder, title))) {
                return rej(
                    new Error(
                        `Failed to clone repository ${title} from ${repoUrl}`
                    )
                );
            }
            res();
        });

        cloneProcess.stderr.on("error", (err) => {
            return rej(err);
        });
    });
}

function writeEnvFile(pathEnvFile, variables) {
    return fs.promises.writeFile(
        pathEnvFile,
        Object.entries(variables)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}="${value}"`)
            .join("\n")
    );
}
