const apiSchemaBuilder = require("api-schema-builder");
const schema = apiSchemaBuilder.buildSchemaSync("./swagger/hotplay.json");


module.exports = function(json, callback) {
    let schemaEndpoint = schema["/replay"]["post"];
    schemaEndpoint.body.validate(json);
    let errResult = beautifyAjvError(schemaEndpoint.body.errors);
    if (callback) {
        if (errResult) {
            callback(errResult);
        }
        else {
            callback(null);
        }
    }
}


function beautifyAjvError(errorArr) {
    let errorObj = {};
    let result = "";

    if (errorArr) {
        for (let i = 0; i < errorArr.length; i++) {
            try {
                let err = errorArr[i];
                let errString = err.dataPath + " " + err.message;
                if (errString.charAt(0) == ".") {
                    errString = errString.substring(1);
                }
                errorObj[err.dataPath] = errString.trim();
                result += errorObj[err.dataPath] + "\n";
            }
            catch (e) {
                console.log(e);
            }
        }

        return result.trim();
    }
    else {
        return null;
    }

}
