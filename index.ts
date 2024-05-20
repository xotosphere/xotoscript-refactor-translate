import { translateText } from "./translation-helper/index";
import fs from "fs";
import path from "path";
import os from "os";

function createSourceMap(fileName) {
	const source = fs.readFileSync(path.join(__dirname, "source/" + fileName + ".json"), "utf-8");

	const regex = /:\s*"([^"]+)"/g;

	const sourceFields = Array.from(source.matchAll(regex))
		.map((el, i) => {
			return el[1];
		})
		.join(" - ");

	let currentIndex = 0;

	const sourceMap = source.replace(regex, () => {
		const mappedString = `:"{{${currentIndex}}}"`;
		currentIndex++;
		return mappedString;
	});

	return { sourceFields, sourceMap };
}

async function translateAll(sourceFields) {
	const result = await Promise.all([translateText(sourceFields, { from: "en", to: "it", headless: false }), translateText(sourceFields, { from: "en", to: "fr", headless: false })]);
	return result as [string, string];
}

function mergeSourceMapWithNewTranslations(sourceMapInitial: string, raw: string) {
	let sourceMap = sourceMapInitial || "unknown";
	const translatedWords = raw.split(" - ");

	translatedWords.forEach((word, i) => {
		if (typeof sourceMap === "string") sourceMap = sourceMap.replace(`{{${i}}}`, word);
	});
	return sourceMap;
}

(async () => {
	const { sourceFields } = createSourceMap("en");
	const translatedFields = await translateAll(sourceFields);

	const file = JSON.stringify(translatedFields);
	fs.writeFileSync(path.join(__dirname, "./output.json"), file);
})();
