//@ts-check
import * as esbuild from 'esbuild'
import fs from 'node:fs';
import { TextDecoder } from 'node:util';

export const scripts = async function() {
    try {
        const output = await esbuild.build({
            entryPoints: [
                '../src/*.ts'
            ],
            minify: true,
            sourcemap: true,
            target: ['es2017', 'chrome58', 'firefox57', 'safari11'],
            //platform: 'browser',
            bundle: true,
            write: false
        })
        return new TextDecoder('utf-8').decode(output.outputFiles[0].contents)
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : `Something went wrong! Cannot continue!`
        console.error(errorMsg)
    }
}