function formatTextIcons(rawText: string, white: boolean = false) {
    if (!rawText) {
        return '';
    }
    const whiteText = white ? 'white' : '';
    return rawText
        .replace(/<KNOWLEDGE>/ig, `<span class="icon-knowledge ${whiteText}"></span>`)
        .replace(/<LOST_KNOWLEDGE>/ig, `<span class="icon-lost-knowledge ${whiteText}"></span>`)
        .replace(/<VP>/ig, '<span class="icon-vp"></span>')
        .replace(/<CITY>/ig, '<span class="icon-monument-city"></span>')
        .replace(/<MEGALITH>/ig, '<span class="icon-monument-megalith"></span>')
        .replace(/<PYRAMID>/ig, '<span class="icon-monument-pyramid"></span>')
        .replace(/<ARTIFACT>/ig, '<span class="icon-artifact"></span>')
        .replace(/<ANCIENT>/ig, '<span class="icon-technology-ancient"></span>')
        .replace(/<WRITING>/ig, '<span class="icon-technology-writing"></span>')
        .replace(/<SECRET>/ig, '<span class="icon-technology-secret"></span>')
        .replace(/\[n°(\d)\]/ig, (fullMatch, number) => `<span class="icon starting-space">${number}</span>`)
        .replace(/\[I\]/ig, '<span class="icon tech-level" data-level="1"></span>')
        .replace(/\[II\]/ig, '<span class="icon tech-level" data-level="2"></span>');
}