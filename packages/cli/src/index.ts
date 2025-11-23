import { Command } from "commander";
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const program = new Command();

program
    .name('shard')
    .description('Shard CLI - Manage your shards')
    .version('0.0.1');

program.command('list')
    .description('List all shards')
    .action(async () => {
        console.log('pulling in shard ...');
        const backend = 'http://localhost:3000';
        try {
            const response = await fetch(`${backend}/api/shards`);
            const data = await response.json();
            console.log(data);
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    });

program.command('pull')
    .description('Pull shard from id')
    .argument('<id>', 'Shard ID to pull')
    .option('-o, --output <path>', 'Output directory path', './')
    .action(async (id, options) => {
        console.log('Pulling shard using id');
        const outPath = options.output;
        console.log(id, outPath);
        try {
            const response = await fetch(`http://localhost:3000/api/shard`, {
                method: "POST", body: JSON.stringify({
                    key: id
                })
            });
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            const contentDisposition = response.headers.get('content-disposition');
            console.log('Content-Disposition:', contentDisposition);
            const filename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] || "";
            console.log('filename', filename);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fullPath = join(outPath, filename);
            // Create directory if it doesn't exist (recursive creates all parent dirs)
            const dir = dirname(fullPath);
            await mkdir(dir, { recursive: true });
            await writeFile(fullPath, buffer);
            console.log(`✅ Shard downloaded successfully`);
        }
        catch (e) {
            console.log('error', e);
            process.exit(1);
        }
    });

program.command("publish")
    .description("Publish a shard")
    .argument("<path>", "Path to the shard file")
    .option("-n, --namespace <namespace>", "Namespace")
    .option("-p, --package <package>", "Package name")
    .option("-s, --shard <shard>", "Shard name")
    .option("-v, --version <version>", "Version")
    .action(async (path, options) => {
        // Validate required options
        if (!options.namespace || !options.package || !options.shard || !options.version) {
            console.error("Error: Missing required fields. Please provide --namespace, --package, --shard, and --version");
            process.exit(1);
        }
        console.log("Publishing shard");
        const backend = "http://localhost:3000";
        try {
            const fileBuffer = await readFile(path);
            const filename = path.split(/[/\\]/).pop()
            console.log({ options })
            const formData = new FormData();
            const fileBlob = new Blob([fileBuffer], { type: 'application/octet-stream' });
            formData.append('file', fileBlob, filename);
            formData.append('namespace', options.namespace);
            formData.append('package', options.package);
            formData.append('shard', options.shard);
            formData.append('version', options.version);

            const response = await fetch(`${backend}/api/publish`, {
                method: "POST",
                body: formData
            });
            console.log(`Status: ${response.status}`);
            const data = await response.json();
            console.log(data);
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    });

program.parse()