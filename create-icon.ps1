# PNG to ICO converter using .NET
Add-Type -AssemblyName System.Drawing

$pngPath = "logo.png"
$icoPath = "icon.ico"

# Load the PNG image
$img = [System.Drawing.Image]::FromFile((Resolve-Path $pngPath))

# Create icon from image
$icon = [System.Drawing.Icon]::FromHandle($img.GetHicon())

# Save as ICO
$fileStream = [System.IO.File]::Create($icoPath)
$icon.Save($fileStream)
$fileStream.Close()

Write-Host "Icon created: $icoPath"
