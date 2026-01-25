//@ts-check
import * as esbuild from 'esbuild'

export const compile_scripts = async function() {
    try {
        await esbuild.build({
            entryPoints: [
                './src/website.ts'
            ],
            minify: true,
            sourcemap: true,
            target: ['es2017', 'chrome58', 'firefox57', 'safari11'],
            bundle: true,
            outfile: './public/default.js'
        })
        return true
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : `Something went wrong! Cannot continue!`
        console.error(errorMsg)
    }
}