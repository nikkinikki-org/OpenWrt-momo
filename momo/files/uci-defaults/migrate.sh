#!/bin/sh

. "$IPKG_INSTROOT/etc/momo/scripts/include.sh"

# since v1.0.2

section_placeholder=$(uci -q get momo.placeholder); [ -z "$section_placeholder" ] && uci set momo.placeholder="placeholder"

# since v1.1.0

proxy_bypass_china_mainland_ip=$(uci -q get momo.proxy.bypass_china_mainland_ip)
proxy_bypass_china_mainland_ip6=$(uci -q get momo.proxy.bypass_china_mainland_ip6)
[ -z "$proxy_bypass_china_mainland_ip6" ] && uci set momo.proxy.bypass_china_mainland_ip6=$proxy_bypass_china_mainland_ip

routing_tproxy_fw_mask=$(uci -q get momo.routing.tproxy_fw_mask); [ -z "$routing_tproxy_fw_mask" ] && uci set momo.routing.tproxy_fw_mask=0xFF
routing_tun_fw_mask=$(uci -q get momo.routing.tun_fw_mask); [ -z "$routing_tun_fw_mask" ] && uci set momo.routing.tun_fw_mask=0xFF

procd=$(uci -q get momo.procd); [ -z "$procd" ] && {
	uci set momo.procd=procd
	uci set momo.procd.fast_reload=$(uci -q get momo.config.fast_reload)
	uci del momo.config.fast_reload
}

# since v1.1.1

dummy_device=$(uci -q get momo.routing.dummy_device); [ -z "$dummy_device" ] && uci set momo.routing.dummy_device=momo-dummy

# since v1.1.2

section_log=$(uci -q get momo.log); [ -z "$section_log" ] && uci set momo.log=log

log_cleanup_enabled=$(uci -q get momo.log.log_cleanup_enabled)
[ -z "$log_cleanup_enabled" ] && {
	log_cleanup_enabled=$(uci -q get momo.config.log_cleanup_enabled)
	[ -n "$log_cleanup_enabled" ] && uci set momo.log.log_cleanup_enabled=$log_cleanup_enabled || uci set momo.log.log_cleanup_enabled=0
}
uci -q del momo.config.log_cleanup_enabled

log_cleanup_cron_expression=$(uci -q get momo.log.log_cleanup_cron_expression)
[ -z "$log_cleanup_cron_expression" ] && {
	log_cleanup_cron_expression=$(uci -q get momo.config.log_cleanup_cron_expression)
	[ -n "$log_cleanup_cron_expression" ] && uci set momo.log.log_cleanup_cron_expression="$log_cleanup_cron_expression" || uci set momo.log.log_cleanup_cron_expression='0 4 * * *'
}
uci -q del momo.config.log_cleanup_cron_expression

log_cleanup_size_enabled=$(uci -q get momo.log.log_cleanup_size_enabled)
[ -z "$log_cleanup_size_enabled" ] && {
	log_cleanup_size_enabled=$(uci -q get momo.config.log_cleanup_size_enabled)
	[ -n "$log_cleanup_size_enabled" ] && uci set momo.log.log_cleanup_size_enabled=$log_cleanup_size_enabled || uci set momo.log.log_cleanup_size_enabled=0
}
uci -q del momo.config.log_cleanup_size_enabled

log_cleanup_size_check_cron_expression=$(uci -q get momo.log.log_cleanup_size_check_cron_expression)
[ -z "$log_cleanup_size_check_cron_expression" ] && {
	log_cleanup_size_check_cron_expression=$(uci -q get momo.config.log_cleanup_size_check_cron_expression)
	[ -n "$log_cleanup_size_check_cron_expression" ] && uci set momo.log.log_cleanup_size_check_cron_expression="$log_cleanup_size_check_cron_expression" || uci set momo.log.log_cleanup_size_check_cron_expression='*/30 * * * *'
}
uci -q del momo.config.log_cleanup_size_check_cron_expression

log_cleanup_size_mb=$(uci -q get momo.log.log_cleanup_size_mb)
[ -z "$log_cleanup_size_mb" ] && {
	log_cleanup_size_mb=$(uci -q get momo.config.log_cleanup_size_mb)
	[ -n "$log_cleanup_size_mb" ] && uci set momo.log.log_cleanup_size_mb=$log_cleanup_size_mb || uci set momo.log.log_cleanup_size_mb=50
}
uci -q del momo.config.log_cleanup_size_mb

# commit
uci commit momo

# exit with 0
exit 0
