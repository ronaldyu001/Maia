from pathlib import Path
from shutil import move


def move_file( from_path: Path, to_path: Path ) -> bool:
    """
    Moves a file. More specificaly:\n
    Copies a file from origin to target. Deletes origin after copy.\n
    
    Args:
        from_path: Source file path
        to_path: Destination path (can be directory or file)
    
    Returns:
        bool: True if move successful, False otherwise
    """
    try:
        # ----- Verify source exists -----
        if not from_path.exists():
            print(f"Source path does not exist: {from_path}")
            return False

        # ----- Handle directory destination -----
        if to_path.is_dir():
            # Create directory if it doesn't exist
            to_path.mkdir(parents=True, exist_ok=True)
            # Move file into directory with same name
            final_path = to_path / from_path.name
            move(str(from_path), str(final_path))
            return True

        # ----- Handle file destination -----
        else:
            # Create parent directories if they don't exist
            to_path.parent.mkdir(parents=True, exist_ok=True)
            # Move and potentially overwrite existing file
            move(str(from_path), str(to_path))
            return True

    except Exception as e:
        print(f"Error moving file: {e}")
        return False