from numpy.random import random, randint


# from labml_app import analyses

def update_equal_gap_equal_sizes(prev: int = 0, size=5, gap: int = 1, max_step=100):
    while prev <= max_step:
        last = prev + size

        step = [*range(prev, last, gap)]
        value = random(len(step))

        prev = step[-1] + gap

        # data = {'step': step, 'value': value}


def update_equal_gap_equal_sizes_diff_gap_between(prev: int = 0, size=5, gap: int = 1, max_step=100):
    while prev <= max_step:
        last = prev + size

        step = [*range(prev, last, gap)]
        value = random(len(step))

        prev = last

        # data = {'step': step, 'value': value}


def update_equal_gap_diff_sizes(prev: int = 0, gap: int = 1, max_step=100):
    while prev <= max_step:
        size = randint(1, 9)
        last = prev + size

        step = [*range(prev, last, gap)]
        value = random(len(step))

        prev = step[-1] + gap

        # data = {'step': step, 'value': value}


def update_equal_gap_diff_sizes_diff_gap_between(prev: int = 0, gap: int = 1, max_step=100):
    while prev <= max_step:
        size = randint(1, 9)
        last = prev + size

        step = [*range(prev, last, gap)]
        value = random(len(step))

        prev = last

        # data = {'step': step, 'value': value}


def update_diff_gap_diff_sizes(prev: int = 0, max_step=100):
    while prev <= max_step:
        size = randint(1, 6)
        last = prev + size

        step = []
        for s in range(size):
            last = last + randint(1, 10)
            step.append(last)
        value = random(len(step))

        prev = last

        # data = {'step': step, 'value': value}


def update_equal_and_diff_gaps_diff_sizes(prev: int = 0, size=5, gap: int = 1, max_step=100):
    while prev <= max_step / 2:
        last = prev + size

        step = [*range(prev, last, gap)]
        value = random(len(step))

        prev = step[-1] + gap

    while prev <= max_step:
        size = randint(1, 6)
        last = prev + size

        step = []
        for s in range(size):
            last = last + randint(1, 10)
            step.append(last)
        value = random(len(step))

        prev = last


if __name__ == "__main__":
    pass
    # update_equal_gap_equal_sizes()
    # update_equal_gap_equal_sizes(gap=2)
    # update_equal_gap_equal_sizes_diff_gap_between(gap=2)

    # update_equal_gap_diff_sizes()
    # update_equal_gap_diff_sizes(gap=2)
    # update_equal_gap_diff_sizes_diff_gap_between(gap=2)

    # update_diff_gap_diff_sizes()

    # update_equal_and_diff_gaps_diff_sizes()
