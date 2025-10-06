import fs from 'node:fs/promises'

const lightCss = await fs.readFile('./scripts/css-var-to-tailwind/light.txt', 'utf8')
const darkCss = await fs.readFile('./scripts/css-var-to-tailwind/dark.txt', 'utf8')

await fs.writeFile('./src/assets/color.css', `:root {\n${lightCss}\n}\n.dark {\n${darkCss}\n}\n`, 'utf8')

const lightVars = lightCss.split('\n').map((line) => line.match(/--[^:]+/)?.[0])
if (!lightVars) throw new Error('No light colors found')

const tailwindColorObj = lightVars.reduce(
  (acc, cur) => {
    if (!cur) return acc
    const color = cur.replace('--', '')
    if (color.includes('alpha')) {
      acc[color] = `var(${cur})`
    } else {
      acc[color] = `var(${cur})`
    }
    return acc
  },
  {} as Record<string, string>
)
await fs.writeFile('./tailwind.config.colors.js', `export default ${JSON.stringify(tailwindColorObj, null, 2)}`, 'utf8')
