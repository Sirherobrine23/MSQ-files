# Oenwrt endpoints requests

# Wireguard status
  - /cgi-bin/luci/admin/status/wireguard?status=1

# Interfaces
  - /cgi-bin/luci/admin/network/iface_status/eth,lan,wan,wire

# Wireless
  - radio1: /cgi-bin/luci/admin/network/wireless_status/radio0.network1
  - scan wireless connect: /cgi-bin/luci/admin/network/wireless_scan_results/radio0

# realtime graphics
  - load: /cgi-bin/luci/admin/status/realtime/load_status
  - Realtime Traffic: /cgi-bin/luci/admin/status/realtime/bandwidth_status/{interface}
  - connections: /cgi-bin/luci/admin/status/realtime/connections_status
