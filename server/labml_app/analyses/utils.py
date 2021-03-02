import math
from typing import List, Dict, Any


def find_common_prefix(names: List[str]):
    shortest = min(names, key=len)
    for i, word in enumerate(shortest):
        for name in names:
            if name[i] != word:
                return shortest[:i]

    return ''


def remove_common_prefix(series: List[Dict[str, Any]], key: str):
    if not series:
        return

    names = []
    for s in series:
        s[key] = s[key].split('.')

        names.append(s[key])

    common_prefix = find_common_prefix(names)

    if not common_prefix:
        return

    len_removed = len(common_prefix)
    for s in series:
        name = s[key][len_removed:]

        s[key] = '.'.join(name)


def replace_nans(series: List[Dict[str, Any]], keys: List[str]):
    for s in series:
        for key in keys:
            if isinstance(s[key], list):
                s[key] = [0 if math.isnan(x) else x for x in s[key]]
            else:
                s[key] = 0 if math.isnan(s[key]) else s[key]


def get_mean_series(res: List[Dict[str, Any]]) -> Dict[str, Any]:
    mean_value = [sum(x) / len(x) for x in zip(*[s['value'] for s in res])]
    mean_smoothed = [sum(x) / len(x) for x in zip(*[s['smoothed'] for s in res])]
    step = res[0]['step']

    return {'step': step, 'value': mean_value, 'smoothed': mean_smoothed, 'name': 'mean'}
