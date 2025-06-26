import winrm
import json

def get_network_usage_via_winrm(vm_ip, username, password):
    try:
        session = winrm.Session(f"http://{vm_ip}:5985/wsman", auth=(username, password),
                                transport='ntlm', server_cert_validation='ignore')

        ps_script = r"""
$adapters = Get-NetAdapterStatistics | Where-Object { $_.ReceivedBytes -ne $null }
$data = foreach ($a in $adapters) {
    [pscustomobject]@{
        AdapterName = $a.Name
        SendKbps = [math]::Round($a.OutboundBytesPerSec * 8 / 1024, 2)
        ReceiveKbps = [math]::Round($a.InboundBytesPerSec * 8 / 1024, 2)
        Timestamp = (Get-Date).ToString("o")
    }
}
$data | ConvertTo-Json -Depth 3
        """
        result = session.run_ps(ps_script)
        return json.loads(result.std_out.decode().strip()) if result.status_code == 0 else {"error": result.std_err.decode().strip()}
    except Exception as e:
        return {"error": str(e)}

def get_vm_list_via_winrm(ip, username, password):
    try:
        endpoint = f"http://{ip}:5985/wsman"
        session = winrm.Session(endpoint, auth=(username, password), transport='ntlm', server_cert_validation='ignore')

        ps_script = """$vms=Get-VM;$vmResults=@();foreach($vm in $vms){$vmNet=Get-VMNetworkAdapter -VMName $vm.Name;$ipAddresses=$vmNet.IPAddresses-join", ";if(-not$ipAddresses){$ipAddresses="No IP assigned"};$vmOS=if($vm.Guest.OSName){$vm.Guest.OSName}else{"Unknown OS"};$vmOSArchitecture=if($vm.Guest.OSArchitecture){$vm.Guest.OSArchitecture}else{"Unknown"};$cpuUsage=[math]::Round((Get-Counter "\Hyper-V Hypervisor Virtual Processor(_Total)\% Total Run Time").CounterSamples.CookedValue,2);$vmCPUUsage="$cpuUsage%";$memoryAssignedGB=[math]::Round($vm.MemoryAssigned/1GB,2);$memoryDemandGB=[math]::Round($vm.MemoryDemand/1GB,2);$memoryAlert=if($memoryDemandGB-gt$memoryAssignedGB){"⚠️ Needs More Memory!"}else{""};$vmVHDs=Get-VHD -VMId $vm.Id -ErrorAction SilentlyContinue;$diskInfo=@{"Disk Count"=if($vmVHDs){$vmVHDs.Count}else{0};"Total Size (GB)"=[math]::Round(($vmVHDs|Measure-Object -Property Size -Sum).Sum/1GB,2)};$uptime=if($vm.Uptime){"$($vm.Uptime.Days)d $($vm.Uptime.Hours)h $($vm.Uptime.Minutes)m"}else{"Not available"};$replication=Get-VMReplication -VMName $vm.Name -ErrorAction SilentlyContinue;$replicationStatus=if($replication){@{"Status"=$replication.ReplicationHealth;"Alert"=if($replication.ReplicationHealth-ne"Normal"){"⚠️ Replication Issue!"}else{""}}}else{@{"Status"="Not configured";"Alert"=""}};$lastBackup=Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Backup';ID=14} -MaxEvents 1 -ErrorAction SilentlyContinue;$backupStatus=if($lastBackup){@{"Last Backup"=$lastBackup.TimeCreated.ToString();"Alert"=""}}else{@{"Last Backup"="No backup found";"Alert"="⚠️ No recent backup!"}};$result=[ordered]@{"Basic Info"=@{"VM Name"=$vm.Name;"State"=$vm.State.ToString();"Generation"=$vm.Generation;"Version"=$vm.Version};"Network"=@{"IP Addresses"=$ipAddresses;"Adapter Count"=$vmNet.Count};"Operating System"=@{"Name"=$vmOS;"Architecture"=$vmOSArchitecture};"Performance"=@{"CPU"=@{"Cores"=$vm.ProcessorCount;"Usage"=$vmCPUUsage};"Memory"=@{"Assigned (GB)"=$memoryAssignedGB;"Demand (GB)"=$memoryDemandGB;"Alert"=$memoryAlert}};"Storage"=$diskInfo;"Uptime"=$uptime;"Replication"=$replicationStatus;"Backup"=$backupStatus};$vmResults+=$result};$vmResults|ConvertTo-Json -Depth 6
"""  
        result = session.run_ps(ps_script)
        return json.loads(result.std_out.decode().strip()) if result.status_code == 0 else {"error": result.std_err.decode().strip()}
    except Exception as e:
        return {"error": str(e)}

def get_system_info_via_winrm(ip, username, password):
    try:
        session = winrm.Session(f"http://{ip}:5985/wsman", auth=(username, password),
                                transport='ntlm', server_cert_validation='ignore')
        ps_script = """$sysInfo = Get-WmiObject -Class Win32_ComputerSystem | Select-Object Name, Domain, Manufacturer, Model, NumberOfProcessors, TotalPhysicalMemory
$diskInfo = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Name -eq "C"} | 
    Select-Object @{Name="Disk Total (GB)";Expression={[math]::round($_.Used/1GB, 2)}}, 
                  @{Name="Disk Free (GB)";Expression={[math]::round($_.Free/1GB, 2)}}

$cpuInfo = Get-WmiObject -Class Win32_Processor | Select-Object -First 1 -Property Name, Manufacturer, NumberOfCores

$networkInfo = Get-WmiObject -Class Win32_NetworkAdapter | Where-Object {$_.NetConnectionID} | Select-Object -ExpandProperty Name

$uptime = (Get-CimInstance -Class Win32_OperatingSystem).LastBootUpTime
$antivirus = (Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object -First 1).displayName
$lastUpdate = (Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn

$cpuUsageSample = Get-Counter '\Processor(_Total)\% Processor Time'
$cpuUsage = [math]::Round($cpuUsageSample.CounterSamples[0].CookedValue, 2)
$freeRAMBytes = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory * 1024
$usedRAMGB = [math]::Round(($sysInfo.TotalPhysicalMemory - $freeRAMBytes) / 1GB, 2)
$result = @{
    "Hypervisor Name" = $sysInfo.Name
    "Domain" = $sysInfo.Domain
    "OS" = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    "Installed RAM (GB)" = [math]::round($sysInfo.TotalPhysicalMemory / 1GB, 2)
    "Used RAM (GB)" = $usedRAMGB
    "Disk Total (GB)" = $diskInfo."Disk Total (GB)"
    "Disk Free (GB)" = $diskInfo."Disk Free (GB)"
    "Processor Model" = $cpuInfo.Name
    "Processor Manufacturer" = $cpuInfo.Manufacturer
    "Logical Processors" = $cpuInfo.NumberOfCores
    "CPU Usage (%)" = $cpuUsage
    "IPv4 Address" = (Test-Connection -ComputerName $env:COMPUTERNAME -Count 1).Address[0].IPAddressToString
    "Network Cards" = ($networkInfo -join ', ')
    "Uptime (hours)" = [math]::Round(((Get-Date) - $uptime).TotalHours, 2)
    "Antivirus Installed" = $antivirus
    "Last Windows Update" = $lastUpdate
}

$result | ConvertTo-Json -Depth 3""" 
        result = session.run_ps(ps_script)
        return json.loads(result.std_out.decode().strip())
    except Exception as e:
        return {"error": str(e)}

def get_vm_resource_usage(vm_ip, username, password):
    try:
        session = winrm.Session(f"http://{vm_ip}:5985/wsman", auth=(username, password),
                                transport='ntlm', server_cert_validation='ignore')
        ps_script = """$os = Get-WmiObject -Class Win32_OperatingSystem
$cpu = Get-Counter '\Processor(_Total)\% Processor Time'
$totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
$cpuUsage = [math]::Round($cpu.CounterSamples.CookedValue, 2)

$disk = Get-WmiObject Win32_LogicalDisk -Filter "DriveType=3"
$totalDisk = [math]::Round(($disk.Size | Measure-Object -Sum).Sum / 1GB, 2)
$freeDisk = [math]::Round(($disk.FreeSpace | Measure-Object -Sum).Sum / 1GB, 2)

$result = @{
    "CPU Usage (%)" = $cpuUsage
    "Total RAM (GB)" = $totalRAM
    "Used RAM (GB)" = $usedRAM
    "Disk Total (GB)" = $totalDisk
    "Disk Free (GB)" = $freeDisk
}
$result | ConvertTo-Json"""  
        result = session.run_ps(ps_script)
        return json.loads(result.std_out.decode().strip())
    except Exception as e:
        return {"error": str(e)}

def get_running_services_via_winrm(vm_ip, username, password):
    try:
        session = winrm.Session(f"http://{vm_ip}:5985/wsman", auth=(username, password),
                                transport='ntlm', server_cert_validation='ignore')
        ps_script = """Get-WmiObject Win32_Service | Where-Object { $_.State -eq "Running" -and $_.ProcessId -ne 0 } | ForEach-Object {
            $proc = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
            [PSCustomObject]@{
                Name        = $_.Name
                DisplayName = $_.DisplayName
                Status      = $_.State
                StartMode   = $_.StartMode
                PathName    = $_.PathName
                ProcessId   = $_.ProcessId
                CPU         = $proc.CPU
                MemoryMB    = [math]::Round($proc.WorkingSet / 1MB, 2)
            }
        } | ConvertTo-Json -Depth 3"""  # Service listing script
        result = session.run_ps(ps_script)
        return json.loads(result.std_out.decode('utf-8', errors='ignore').strip())
    except Exception as e:
        return {"error": str(e)}

def get_cpu_usage_via_winrm(vm_ip, username, password):
    try:
        session = winrm.Session(f"http://{vm_ip}:5985/wsman", auth=(username, password),
                                transport='ntlm', server_cert_validation='ignore')
        result = session.run_ps('Get-Process | Sort-Object CPU -Descending | Select -First 5 Name, CPU | ConvertTo-Json')
        return json.loads(result.std_out.decode().strip())
    except Exception as e:
        return {"error": str(e)}

def parse_percentage(value):
    try:
        return float(value.replace('%', ''))
    except:
        return 0.0

def parse_vm_performance_data(vm):
    performance = vm.get("Performance", {})
    cpu_info = performance.get("CPU", {})
    mem_info = performance.get("Memory", {})
    disk_info = vm.get("Storage", {})

    return {
        **vm,
        "ip": vm.get("Basic Info", {}).get("VM Name", "unknown"),
        "cpu_usage": parse_percentage(cpu_info.get("Usage", "0%")),
        "memory_usage": float(mem_info.get("Assigned (GB)", 0)),
        "disk_usage": float(disk_info.get("Total Size (GB)", 0))
    }
