<?php
/**
 * Generate bcrypt password hash for cms/config.php
 * Usage: php cms/tools/hash-password.php "your-secure-password"
 */
if ($argc < 2) {
    fwrite(STDERR, "Usage: php hash-password.php \"your-password\"\n");
    exit(1);
}
echo password_hash($argv[1], PASSWORD_DEFAULT) . PHP_EOL;
