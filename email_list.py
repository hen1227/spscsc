def save_email_to_file(email):
    with open("emails.txt", "a+") as file:
        file.seek(0)  # Set the file pointer to the beginning of the file
        email_list = file.read().splitlines()
        if email.lower() not in email_list:
            file.write(f"{email.lower()}\n")
            return True
        else:
            return False


def remove_email_from_file(email):
    with open("emails.txt", "r+") as file:
        email_list = file.read().splitlines()
        if email.lower() in email_list:
            email_list.remove(email.lower())
            file.seek(0)  # Set the file pointer to the beginning of the file
            file.truncate()  # Clear the file content
            file.writelines(f"{e}\n" for e in email_list)
            return True
        else:
            return False