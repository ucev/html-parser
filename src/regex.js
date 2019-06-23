const NAME_REG = `[-a-z][-a-z0-9]*`;
const ATTR_REG=`(?<name>${NAME_REG})\s*(?:=\s*"(?<value>(?:\\.|[^"])*)")?`
const DOCTYPE_REG = String.raw`<!doctype(?<attrs>\s+${ATTR_REG})>`;
const OPEN_TAG_REG = String.raw`<(?<tag>${NAME_REG})(?<attrs>(\s+(${ATTR_REG}))*)\s*(?<closed>/?)>`;
const CLOSE_TAG_REG = String.raw`<\s*/\s*(?<tag>${NAME_REG})\s*>`;
const TEXT_NODE_REG = String.raw`(?<text>[^<>]+)`;
const COMMENT_REG = String.raw`<!--(?<comment>.*?)-->`;
const STYLE_REG = String.raw`(?<content>(?:"(?:\\.|[^"])*"|/\*.*?\*/|[^"])*?)(?=</\s*style\s*>)`;
const SCRIPT_REG = String.raw`(?<content>(?:"(?:\\.|[^"])*"|//.*?\n|/\*.*?\*/|[^"])*?)(?=</\s*script\s*>)`;

module.exports = {
    DOCTYPE: new RegExp(DOCTYPE_REG, 'isyu'),
    OPENTAG: new RegExp(OPEN_TAG_REG, 'isyu'),
    CLOSETAG: new RegExp(CLOSE_TAG_REG, 'isyu'),
    TEXT: new RegExp(TEXT_NODE_REG, 'isyu'),
    COMMENT: new RegExp(COMMENT_REG, 'isyu'),
    STYLE: new RegExp(STYLE_REG, 'isyu'),
    SCRIPT: new RegExp(SCRIPT_REG, 'isyu'),
    RAW_TEXT: {
        ATTR_REG
    }
};
