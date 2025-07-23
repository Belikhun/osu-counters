import * as chokidar from 'chokidar';
import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @constant {string} modulesBaseDir - The base directory where your module folders are located.
 * This path is relative to the script's location.
 * Given your `package.json` is in `static/` and this script is in `static/scripts/`,
 * `../` points to `static/`.
 */
const modulesBaseDir: string = path.resolve(__dirname, '../');

/**
 * @interface ModuleInfo
 * @description Defines the structure for information about each module.
 */
interface ModuleInfo {
	name: string;
	scssPath: string;
}

/**
 * @function compileScss
 * @param {string} scssFilePath - The full path to the SCSS file to compile.
 * @param {string} moduleName - The name of the module (for logging purposes).
 * @description Compiles a single SCSS file to CSS in the same directory.
 */
const compileScss = (scssFilePath: string, moduleName: string): void => {
	// Determine the output CSS file path (same directory, styles.css)
	const cssFilePath: string = path.join(path.dirname(scssFilePath), 'styles.min.css');

	console.log(`[${moduleName}]: Compiling ${scssFilePath} to ${cssFilePath}...`);

	// Execute the Sass compilation command with compressed style and verbose output
	const command: string = `sass --style=compressed --verbose "${scssFilePath}":"${cssFilePath}"`;

	exec(command, (error: ExecException | null, stdout: string, stderr: string): void => {
		if (error) {
			console.error(`[${moduleName} ERROR]: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`[${moduleName} STDERR]: ${stderr.trim()}`);
		}
		if (stdout) {
			console.log(`[${moduleName}]: ${stdout.trim()}`);
		}
		console.log(`[${moduleName}]: Compilation complete.`);
	});
};

/**
 * @function findAndWatchScssFiles
 * @description Scans the `modulesBaseDir` for subdirectories containing `styles.scss`
 * and sets up a chokidar watcher for each.
 */
const findAndWatchScssFiles = (): void => {
	let moduleDirs: ModuleInfo[] = [];

	try {
		// Read entries in the base directory, including their types (file/directory)
		const entries: fs.Dirent[] = fs.readdirSync(modulesBaseDir, { withFileTypes: true });

		entries.forEach((entry: fs.Dirent) => {
			// Check if the entry is a directory
			if (entry.isDirectory()) {
				const modulePath: string = path.join(modulesBaseDir, entry.name);
				const scssFilePath: string = path.join(modulePath, 'styles.scss');

				// Check if 'styles.scss' exists within this module directory
				if (fs.existsSync(scssFilePath)) {
					moduleDirs.push({
						name: entry.name, // e.g., 'boverlay'
						scssPath: scssFilePath
					});
				}
			}
		});
	} catch (err: any) { // Use 'any' for catch block error type for broader compatibility
		console.error('Error reading modules directory:', err.message || err);
		process.exit(1); // Exit if we can't read the directory
	}

	if (moduleDirs.length === 0) {
		console.log('No module directories with styles.scss found to watch.');
		return;
	}

	console.log(`Found ${moduleDirs.length} module(s) with styles.scss:`);
	moduleDirs.forEach((mod: ModuleInfo) => console.log(`- ${mod.name}: ${mod.scssPath}`));
	console.log('\nStarting Chokidar watch...\n');

	// Set up a watcher for each identified styles.scss file
	moduleDirs.forEach((moduleInfo: ModuleInfo) => {
		const { name: moduleName, scssPath } = moduleInfo;

		// Initialize chokidar watcher for the specific styles.scss file
		const watcher: chokidar.FSWatcher = chokidar.watch(scssPath, {
			ignored: /(^|[\/\\])\../, // ignore dotfiles
			persistent: true,
			ignoreInitial: true // Do not trigger 'add' or 'change' events on startup for existing files
		});

		watcher
			.on('add', (path: string) => { // In case a styles.scss is added later
				console.log(`[${moduleName}]: New styles.scss added: ${path}`);
				compileScss(path, moduleName);
			})
			.on('change', (path: string) => {
				console.log(`[${moduleName}]: styles.scss changed: ${path}`);
				compileScss(path, moduleName);
			})
			.on('unlink', (path: string) => {
				console.log(`[${moduleName}]: styles.scss removed: ${path}`);
			})
			.on('error', (error) => console.error(`[${moduleName} WATCHER ERROR]: ${(error as Error).message}`));

		// Initial compilation for all files when the script starts
		compileScss(scssPath, moduleName);
	});

	// Keep the Node.js process alive
	process.stdin.resume();

	// Handle process termination (Ctrl+C)
	process.on('SIGINT', () => {
		console.log('\nStopping watchers and exiting...');
		// It's good practice to close individual watchers if they were stored,
		// but chokidar.unwatch('**/*') is a broad way to stop all managed by chokidar.
		// For individual watchers, you'd iterate `moduleDirs` and call `watcher.close()`
		// on each stored watcher instance.
		process.exit(0);
	});
};

// Run the function to find and watch files
findAndWatchScssFiles();