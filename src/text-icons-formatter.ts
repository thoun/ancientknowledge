function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/<KNOWLEDGE>/ig, '<span class="icon knowledge"></span>')
        .replace(/<VP>/ig, '<span class="icon vp"></span>')
        .replace(/<CITY>/ig, '<span class="icon city"></span>')
        .replace(/<MEGALITH>/ig, '<span class="icon megalith"></span>')
        .replace(/<MONOLITH>/ig, '<span class="icon megalith"></span>') // TODO
        .replace(/<PYRAMID>/ig, '<span class="icon pyramid"></span>')
        .replace(/<ARTIFACT>/ig, '<span class="icon artifact"></span>');
}