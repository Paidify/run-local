import path from "path";

export const __dirname = process.execPath.endsWith("paidify.exe")
    ? path.join(process.execPath, "..")
    : process.cwd();
