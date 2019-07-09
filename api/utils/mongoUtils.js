function getFieldFromDuplicateError(error) {
    const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i
    const match =  error.message.match(regex);
    const field = match[1] || match[2];

    return field&&field[0].toUpperCase()+field.slice(1);
}

module.exports = {
    getFieldFromDuplicateError
};