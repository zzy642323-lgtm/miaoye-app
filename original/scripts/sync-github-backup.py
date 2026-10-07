"""Copy project files to the existing private backup checkout without secrets/build caches."""
import shutil
import subprocess
from pathlib import Path

source = Path(__file__).resolve().parents[1]
workspace = source.parent
backup = workspace / 'miaoye-github'
if not (backup / '.git').is_dir():
    raise RuntimeError('Existing backup Git checkout required')
files = subprocess.check_output(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], cwd=source).decode('utf-8').split('\0')
copied = 0
for name in files:
    if not name:
        continue
    relative = Path(name)
    if any(part in {'.git', '.env', '.meoo', '.sites-runtime', '.openai', 'node_modules', 'downloads', 'qa'} for part in relative.parts):
        continue
    if relative.name.startswith('.env') and relative.name != '.env.example':
        continue
    if relative.suffix in {'.keystore', '.jks', '.pem', '.idsig', '.apk'}:
        continue
    original = source / relative
    if not original.is_file():
        continue
    target = backup / 'original' / relative
    if not target.resolve().is_relative_to((backup / 'original').resolve()):
        raise RuntimeError('Backup path outside destination')
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(original, target)
    copied += 1
deployment = workspace / 'miaoye-meoo'
for item in deployment.rglob('*'):
    relative = item.relative_to(deployment)
    if relative.parts[:2] == ('src', 'supabase'):
        continue  # CLI-generated connection files are unnecessary for the server backup.
    if any(part in {'.git', '.env', '.meoo', 'node_modules', '.cloud-qa'} for part in relative.parts) or relative.name.startswith('.env') or relative.suffix == '.log':
        continue
    if not item.is_file():
        continue
    target = backup / 'meoo' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(item, target)
print(f'Copied {copied} source files and the deployment; credentials and signing keys excluded.')
