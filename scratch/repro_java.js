const { executeCode } = require('../server/utils/localExecutor');

async function test() {
  const userCode = `
import java.util.*;

// Abstract class
abstract class Account {
    protected double balance;

    public Account(double balance) {
        this.balance = balance;
    }

    abstract void deposit(double amount);
    abstract void withdraw(double amount);

    public double getBalance() {
        return balance;
    }
}

// CheckingAccount class
class CheckingAccount extends Account {

    public CheckingAccount(double balance) {
        super(balance);
    }

    void deposit(double amount) {
        balance += amount;
    }

    void withdraw(double amount) {
        balance -= amount;
    }
}

// SavingsAccount class
class SavingsAccount extends Account {

    public SavingsAccount(double balance) {
        super(balance);
    }

    void deposit(double amount) {
        balance += amount;
    }

    void withdraw(double amount) {
        balance -= amount;
    }
}

// Main class
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        if (!sc.hasNextLine()) {
            System.err.println("No input provided!");
            return;
        }

        String input = sc.nextLine();
        String[] tokens = input.split(" ");

        String accountType = tokens[0];
        double initialBalance = Double.parseDouble(tokens[1]);

        Account account;

        // Polymorphism
        if (accountType.equals("CheckingAccount")) {
            account = new CheckingAccount(initialBalance);
        } else {
            account = new SavingsAccount(initialBalance);
        }

        for (int i = 2; i < tokens.length; i += 2) {
            String operation = tokens[i];
            double amount = Double.parseDouble(tokens[i + 1]);

            if (operation.equals("deposit")) {
                account.deposit(amount);
            } else if (operation.equals("withdraw")) {
                account.withdraw(amount);
            }
        }

        System.out.println((int) account.getBalance());
    }
}
  `;
  
  console.log('Testing User Java code with valid input...');
  const result1 = await executeCode('java', userCode, 'CheckingAccount 1000 deposit 500 withdraw 200');
  console.log('Result 1 (Expected 1300):', JSON.stringify(result1, null, 2));

  console.log('\nTesting User Java code with EMPTY input (should NOT hang now)...');
  const result2 = await executeCode('java', userCode, '');
  console.log('Result 2 (Should fail quickly):', JSON.stringify(result2, null, 2));
}

test().catch(console.error);
