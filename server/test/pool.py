from concurrent.futures import ThreadPoolExecutor
from time import sleep


def task(message):
    print('task')
    sleep(2)
    return message


def main():
    executor = ThreadPoolExecutor(5)
    future = executor.submit(task, ("Completed"))
    print(future.done())
    sleep(3)
    print(future.done())
    print(future.result())


if __name__ == '__main__':
    main()
