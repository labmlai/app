def modinv(e, phi):
    d_old = 0
    r_old = phi
    d_new = 1
    r_new = e
    while r_new > 0:
        a = r_old // r_new

        print(a)

        (d_old, d_new) = (d_new, d_old - a * d_new)
        (r_old, r_new) = (r_new, r_old - a * r_new)

    return d_old % phi if r_old == 1 else None




print(modinv(7, 40))