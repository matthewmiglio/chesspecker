import os

import pyperclip


def generate_copy_string(
    files_to_print, ignore_folders, file_tree_top_dir, files_to_ignore
):
    """
    Generates a string containing a readable file tree, followed by the content of specified files.
    This string is copied to the clipboard for easy pasting.

    Args:
        files_to_print (list): A list of file paths whose content should be printed.
        ignore_folders (list): A list of folder names to ignore during traversal.
        file_tree_top_dir (str): The top-level directory of the file tree to start the traversal from.
        files_to_ignore (list): A list of file names to ignore during traversal.
    """

    def print_tree(current_dir, indent_level=0):
        """
        Recursively prints the file tree, ignoring specified folders and files.
        """
        tree_str = ""
        try:
            # List all entries in the directory
            entries = os.listdir(current_dir)
        except PermissionError:
            # Skip folders without permission
            return ""

        # Filter out ignored folders and files
        entries = [
            entry
            for entry in entries
            if entry not in ignore_folders and entry not in files_to_ignore
        ]

        for entry in sorted(entries):
            full_path = os.path.join(current_dir, entry)

            # If it's a directory, recurse deeper
            if os.path.isdir(full_path):
                tree_str += "    " * indent_level + f"📁 {entry}/\n"
                tree_str += print_tree(full_path, indent_level + 1)
            elif os.path.isfile(full_path):
                tree_str += "    " * indent_level + f"📄 {entry}\n"
        return tree_str

    def get_file_content(file_path):
        """
        Reads the content of the file and returns it as a string.
        Handles both normal text files and some code files (e.g., handling binary files, encoding issues).
        """
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except UnicodeDecodeError:
            # Handle non-text files or binary files gracefully
            return f"Unable to read content of {file_path} as text."
        except Exception as e:
            return f"Error reading {file_path}: {str(e)}"

    # Start constructing the output string
    output_str = "File Tree:\n"

    # Print the file tree (excluding ignored folders and files)
    output_str += print_tree(file_tree_top_dir)

    # Add the content of the specified files
    for file_path in files_to_print:
        if os.path.exists(file_path) and os.path.isfile(file_path):
            output_str += f"\nThis is the {file_path} code:\n"
            output_str += get_file_content(file_path)
            output_str += "\n"  # Add a newline between file contents

    # Copy the result to the clipboard
    pyperclip.copy(output_str)
    print("The file tree and content have been copied to the clipboard.")


if __name__ == "__main__":
    file_tree_top_dir = os.getcwd()

    files_to_print = [
        r"H:\my_files\my_programs\kinivi_gesture_train\inference-lite\keypoint_classification.py",
        r"H:\my_files\my_programs\kinivi_gesture_train\inference-lite\point_history_clasisfication.py",
        r"H:\my_files\my_programs\kinivi_gesture_train\test-kinivi-gesture\camera_prediction.py",
        r"H:\my_files\my_programs\kinivi_gesture_train\test-kinivi-gesture\storage_prediction.py",
        r"H:\my_files\my_programs\kinivi_gesture_train\train-keypoint-classifier\train.py",
        r"H:\my_files\my_programs\kinivi_gesture_train\train-point-history-classifier\add_point_history_data.ipynb",
        r"H:\my_files\my_programs\kinivi_gesture_train\train-point-history-classifier\train.py",
    ]

    ignore_folders = [
        "node_modules",
        ".git",
        ".next",
    ]
    files_to_ignore = [
        "README.md",
        "prompt.py",
    ]
    generate_copy_string(
        files_to_print, ignore_folders, file_tree_top_dir, files_to_ignore
    )
    print("copied the text!!\n" * 10)
