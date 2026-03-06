const edit_profile_b = document.getElementById("edit_profile_button")
const profile_editor = document.getElementById("edit-board")
const close_edit = document.getElementById("close_board")

edit_profile_b.addEventListener("click", () =>{
    profile_editor.classList.remove("hidden");
});

close_edit.addEventListener("click", () =>{
    profile_editor.classList.add("hidden")
})
