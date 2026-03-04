# Git SSH

Use SSH so `git pull` and `git push` can authenticate with your key instead of username/password or PAT every time.

## 1) Check existing SSH keys

In PowerShell:

```powershell
ls ~/.ssh
```

Look for files like:

- `id_ed25519` and `id_ed25519.pub` (recommended)
- `id_rsa` and `id_rsa.pub` (older)

If you already have a key pair you want to use, skip to step 3.

## 2) Generate a new SSH key

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted:

- File location: press Enter to use default (`~/.ssh/id_ed25519`)
- Passphrase: recommended (adds protection)

## 3) Start ssh-agent and add your key

### Windows PowerShell

```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add ~/.ssh/id_ed25519
```

### macOS/Linux

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

## 4) Add public key to your Git host (GitHub/GitLab)

Print key content:

```powershell
Get-Content ~/.ssh/id_ed25519.pub
```

Copy full output, then:

- GitHub: **Settings -> SSH and GPG keys -> New SSH key**
- GitLab: **Preferences -> SSH Keys**

Paste and save.

## 5) Verify SSH connection

For GitHub:

```powershell
ssh -T git@github.com
```

Expected first-time prompt:

- Type `yes` to trust host fingerprint.

Successful message is similar to:

- `Hi <username>! You've successfully authenticated...`

## 6) Switch repository remote from HTTPS to SSH

Check current remotes:

```powershell
git remote -v
```

If it shows `https://...`, set SSH URL:

```powershell
git remote set-url origin git@github.com:<owner>/<repo>.git
```

Verify:

```powershell
git remote -v
```

Now it should show `git@github.com:...`

## 7) Test pull and push

```powershell
git pull
git push
```

If key and remote are correct, both commands work without HTTPS credentials.

## Common issues

- `Permission denied (publickey)`: key not loaded, wrong key, or key not added to Git host.
- Still asks for password/token: remote is still HTTPS (`git remote -v` to confirm).
- Multiple keys/accounts: create `~/.ssh/config` and map host aliases.

Example `~/.ssh/config`:

```ssh
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
```

Then set remote like:

```powershell
git remote set-url origin git@github-personal:<owner>/<repo>.git
```

