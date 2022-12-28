# homebridge-lanbon
Lanbon switch plugin for Homebridge - stateful switches

* Forked from homebridge-udp-multiswitch

_________________________________________

## Configuration Params

|             Parameter            |                       Description                       | Required |
| -------------------------------- | ------------------------------------------------------- |:--------:|
| `name`                           | name of the accessory                                   |          |
| `switch_type`                    | 1 (for one gang) or 2 (for 2 gang) or 3 (for 3 gang)    |     ✓    |
| `multi_switch`                   | array of names for each gang (default: [1, 2, 3])       |          |
| `host`                           | broadcast address (eg: 192.168.1.255)                   |     ✓    |
| `device_id`                      | device id of switch                                     |          |

### Example configuration


```
{
        "accessory": "LanbonSwitch",
        "name": "Bedroom",
        "switch_type": 3,
        "multi_switch": ["Chandelier", "Wall mount", "Hidden light"],
        "host": "192.168.1.255",
        "device_id": "201504xxxx",
}
```

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install homebridge-http using: `npm install -g homebridge-lanbon`
3. Update your config file


## Reference

1. https://jan.newmarch.name/IoT/Home/Lanbon/
