# Alternative Manifest for Maximum Compatibility

Write-Host "🔧 Creating maximum compatibility manifest for AE 2025..." -ForegroundColor Cyan

$manifestContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="10.0" ExtensionBundleId="com.letterblack.codetest.alt" 
    ExtensionBundleVersion="1.0.0" 
    ExtensionBundleName="CodeTest Alt">
    
    <ExtensionList>
        <Extension Id="com.letterblack.codetest.alt.panel" Version="1.0.0"/>
    </ExtensionList>
    
    <ExecutionEnvironment>
        <HostList>
            <Host Name="AEFT" Version="[15.0,99.9]"/>
        </HostList>
        <LocaleList>
            <Locale Code="All"/>
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="12.0"/>
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    
    <DispatchInfoList>
        <Extension Id="com.letterblack.codetest.alt.panel">
            <DispatchInfo>
                <Resources>
                    <MainPath>./index.html</MainPath>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>CodeTest Alt</Menu>
                    <Geometry>
                        <Size>
                            <Height>500</Height>
                            <Width>400</Width>
                        </Size>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
'@

$altPath = "G:\Developments\15_AI_AE\Adobe_AI_Generations\test-isolated\CSXS\manifest-alt.xml"
$manifestContent | Out-File -FilePath $altPath -Encoding UTF8

Write-Host "✅ Alternative manifest created at: $altPath" -ForegroundColor Green
Write-Host "If the current extension doesn't work, we can try this simpler version." -ForegroundColor Yellow
