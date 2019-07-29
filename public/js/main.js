document.addEventListener("DOMContentLoaded", function() {
    var file = document.getElementById("replay-file");

    document.getElementById("replay-button").addEventListener("click", function() {
        file.click();
    });

    file.addEventListener("change", function() {
        var form = document.getElementById("replay");
        if (chkFileType(file)) {
            var reader = new FileReader();
            reader.onload = function() {
                form.reset();
                submitReplay(reader.result);
            }
            reader.readAsText(file.files[0], "UTF-8");
        }
        else {
            form.reset();
        }
    });
});

window.onload = function() {
    Particles.init({
        selector: ".background",
        color: "#88c8ff",
        maxParticles: 150,
        connectParticles: true
    });
};


function submitReplay(replay) {
    var submit = document.createElement("form");
    submit.method = "POST";
    submit.acceptCharset = "UTF-8";
    submit.action = "/replay";
    submit.style.display = "none";

    var input = document.createElement("input");
    input.type = "text";
    input.name = "json";
    input.value = replay;
    submit.appendChild(input);

    document.getElementsByClassName("background")[0].style.display = "none";
    document.getElementsByClassName("top")[0].style.display = "none";
    document.getElementsByClassName("loader")[0].style.display = "block";

    document.body.appendChild(submit);
    submit.submit();
}


function chkFileType(obj) {
	var file_kind = obj.value.lastIndexOf('.');
	var file_name = obj.value.substring(file_kind + 1, obj.length);
	var file_type = file_name.toLowerCase();
	var check_file_type = new Array();
	check_file_type = ['json'];

	if(check_file_type.indexOf(file_type) == -1) {
		alert('Only JSON file can be uploaded.');
		return false;
    }

    return true;
}
