from typing import List, Dict, Any


def remove_common_prefix(series: List[Dict[str, Any]], key: str):
    series = series.copy()

    names = []
    for s in series:
        if 'loss' in s[key]:
            continue

        names.append(s[key].split('.'))

    shortest = min(names, key=len)
    for i, word in enumerate(shortest):
        for name in names:
            if name[i] != word:
                print(shortest[:i])
                return
