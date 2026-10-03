const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const registryPath = path.resolve(__dirname, "../action-versions.json");
const workflowsPath = path.resolve(root, ".github/workflows");

const registry = JSON.parse(
    fs.readFileSync(registryPath, "utf8")
);

function getWorkflowFiles(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    return fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(
            (entry) =>
                entry.isFile() &&
                (entry.name.endsWith(".yml") ||
                    entry.name.endsWith(".yaml"))
        )
        .map((entry) => path.join(directory, entry.name));
}

function updateWorkflow(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    for (const [action, version] of Object.entries(registry)) {
        const escapedAction = action.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const pattern = new RegExp(
            `(${escapedAction}@)[^\\s"'#]+`,
            "g"
        );

        content = content.replace(
            pattern,
            `$1${version}`
        );
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${path.relative(root, filePath)}`);
        return true;
    }

    console.log(`No changes: ${path.relative(root, filePath)}`);
    return false;
}

function main() {
    const workflowFiles = getWorkflowFiles(workflowsPath);

    if (workflowFiles.length === 0) {
        console.log("No GitHub workflow files found.");
        return;
    }

    let changedFiles = 0;

    for (const workflow of workflowFiles) {
        if (updateWorkflow(workflow)) {
            changedFiles++;
        }
    }

    console.log(
        `\nCompleted. ${changedFiles} workflow file(s) updated.`
    );
}

main();
