import path from 'path';
import fs from 'fs';
import core from '@actions/core';
import exec from '@actions/exec';
import tc from '@actions/tool-cache';

async function installXcode(xcodeVersion, appleID, appleIDPassword) {
  const IS_MACOS = process.platform === 'darwin';

  if (!IS_MACOS) {
    throw new Error(`${process.platform} is not supported!`);
  }

  if (
    (await exec.exec('xcversion', ['select', xcodeVersion], {
      ignoreReturnCode: true
    })) != 0
  ) {
    core.warning(`Xcode ${xcodeVersion} not avilable in local.`);

    if (!appleID) {
      throw new Error(`apple-id is required to download Xcode.`);
    }

    if (!appleIDPassword) {
      throw new Error(`apple-id-password is required to download Xcode.`);
    }

    core.startGroup('Install Xcode');

    await exec.exec('xcversion', ['update'], {
      cwd: process.env.TMPDIR,
      env: {
        ...process.env,
        XCODE_INSTALL_USER: appleID,
        XCODE_INSTALL_PASSWORD: appleIDPassword,
        SPACESHIP_SKIP_2FA_UPGRADE: 1,
      }
    });

    const tempDirectory = process.env['RUNNER_TEMP'];
    const downloadURL = path.join(tempDirectory, `Xcode-${xcodeVersion}.xip`);

    const cachedURL = tc.find('Xcode', xcodeVersion); 
    if (cachedURL != null) {
      core.info(`Found in cache @ ${cachedURL}`);
    }

    await exec.exec('xcversion', ['install', xcodeVersion, `--url=${cachedURL || downloadURL}`, '--no-clean'], {
      cwd: process.env.TMPDIR,
      env: {
        ...process.env,
        XCODE_INSTALL_USER: appleID,
        XCODE_INSTALL_PASSWORD: appleIDPassword,
        SPACESHIP_SKIP_2FA_UPGRADE: 1,
      }
    });

    if (fs.statSync(downloadURL).isFile()) {
      tc.cacheFile(downloadURL, `Xcode-${xcodeVersion}.xip`, 'Xcode', xcodeVersion);
    }

    core.endGroup();

    await exec.exec('xcversion', ['select', xcodeVersion]);
  }

  await exec.exec(`sudo xcodebuild -license accept`);
}

// most @actions toolkit packages have async methods
export async function run() {
  try {
    let xcodeVersion = core.getInput('xcode-version', { required: true });
    let appleID = core.getInput('apple-id');
    let appleIDPassword = core.getInput('apple-id-password');

    await installXcode(xcodeVersion, appleID, appleIDPassword);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
