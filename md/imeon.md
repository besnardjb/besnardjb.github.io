# IMEON Status Exporter

This is a simple python tool to extract and expose the state of an [IMEON 3.6 Smart-Grid Inverter](https://www.ienergy-us.com/uploads/files/User-guide-IMEON-3.6-EN.pdf).
The code works with the IMEON OS One internal API by querying some JSON endpoints after loging-in with default credentials.

The main use of this code is to create a prometheus exporter from the IMEON data.

## Installation

```
git clone https://github.com/besnardjb/imeon_monitor
cd imeon_monitor
pip install .
```

### Systemd Integration

A systemd example unit is given [here](https://raw.githubusercontent.com/besnardjb/imeon_monitor/master/imeonm.service)

```sh
##!!! FIRST edit the file to you needs particularly the command
##!!!
# As root add the unit
cp imeonm.service /etc/systemd/system/
# Update units
systemctl daemon-reload
# Start the Unit
systemctl start imeonm
# Check it runs
systemctl status imeonm
# Enable it
systemctl enable imeonm
# Debug with 'journalctl -xe -u imeonm'
```

## Usage

```
usage: imeonm [-h] -i IMEON [-s] [-S] [-u] [-d] [-f] [-b] [-l] [-t SCAN_PERIOD] [-p] [-P PROMETHEUS_EXPORTER_PORT]

IMEON Monitoring Interface.

optional arguments:
  -h, --help            show this help message and exit
  -i IMEON, --imeon IMEON
                        URL/IP of the IMEON 3.6 OS
  -s, --scan            Output raw scan data in JSON
  -S, --status          Output raw status data in JSON
  -u, --update-status   Output raw update status data in JSON
  -d, --data            Output raw general data data in JSON
  -f, --soft-status     Output raw software status in JSON
  -b, --battery-status  Output raw software status in JSON
  -l, --lithium-status  Output raw lithium status in JSON
  -t SCAN_PERIOD, --scan-period SCAN_PERIOD
                        How often to pull samples when polling
  -p, --prometheus-exporter
                        Enable the prometheus exporter
  -P PROMETHEUS_EXPORTER_PORT, --prometheus-exporter-port PROMETHEUS_EXPORTER_PORT
                        Port on which to run the prometheus exporter
```


## Examples

### Query Current State

```
imeonm -i 192.168.1.99 -s
```

```js
{
    "val": [
        {
            "ac_input_active_power_s": null,
            "ac_input_active_power_t": null,
            "ac_input_total_active_power": -58,
            "ac_output_active_power_s": null,
            "ac_output_active_power_t": null,
            "ac_output_apperent_power_r": 95,
            "ac_output_apperent_power_s": null,
            "ac_output_apperent_power_t": null,
            "ac_output_current": 0.4,
            "ac_output_current_s": null,
            "ac_output_current_t": null,
            "ac_output_frequency": 50.0,
            "ac_output_power_r": 51,
            "ac_output_total_active_power": 51,
            "ac_output_total_apperent_power": 95,
            "ac_output_voltage": 239.7,
            "ac_output_voltage_s": null,
            "ac_output_voltage_t": null,
            "battery_current": 0.0,
            "battery_power": null,
            "battery_soc": 29,
            "em_power": 134,
            "em_power_from_protocol": null,
            "em_status": 1,
            "external_battery_temperature": 0,
            "grid_current_r": 0.1,
            "grid_current_s": null,
            "grid_current_t": null,
            "grid_frequency": 49.99,
            "grid_power_r": -58,
            "grid_voltage_r": 239.7,
            "grid_voltage_s": null,
            "grid_voltage_t": null,
            "inner_temperature": 32,
            "inverter_power": null,
            "max_temperature_detecting_pointers": 42,
            "output_load_percent": 3,
            "p_battery_voltage": 49.6,
            "p_bus_voltage": null,
            "pv_input_power1": 251,
            "pv_input_power2": 0,
            "pv_input_voltage1": 265.1,
            "pv_input_voltage2": null,
            "solar_input_current1": 1.0,
            "solar_input_current2": null,
            "time": "2022/09/07 17:16:38",
            "timestamp": 1662570998.724565
        }
    ]
}
```

### Run Prometheus Exporter (exports `-s` fields)

```sh
# Export data in exporter every 5 seconds
# Default port is 13371 can be changed with -P
imeonm -i 192.168.1.99 -p -t 5
```

```
Started IMEON Prometheus Exporter on port 13371
```

