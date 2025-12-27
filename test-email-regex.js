// Test FIXED email extraction
const text = "Karşılaştıryavuzobuz@gmail.comgayeobuz23@hotmail.comatahanobuz@gmail.com";

const results = [];

for (let i = 0; i < text.length; i++) {
    if (text[i] === '@') {
        console.log(`\nFound @ at position ${i}`);

        // Extract local part
        let localStart = i - 1;
        while (localStart >= 0 && /[a-zA-Z0-9._%+-]/.test(text[localStart])) {
            localStart--;
        }
        localStart++;

        // Extract domain - STOP AT TLD!
        let domainEnd = i + 1;
        let lastDotPos = -1;

        while (domainEnd < text.length && /[a-zA-Z0-9.-]/.test(text[domainEnd])) {
            if (text[domainEnd] === '.') {
                lastDotPos = domainEnd;
            }
            domainEnd++;
        }

        // Check valid TLD after last dot
        if (lastDotPos > i) {
            const tldPart = text.substring(lastDotPos + 1, domainEnd);
            console.log(`  TLD candidate: "${tldPart}"`);

            // TLD must be 2+ letters, all alphabetic
            if (tldPart.length >= 2 && /^[a-zA-Z]+$/.test(tldPart)) {
                // Trim domain to just after TLD
                domainEnd = lastDotPos + 1 + tldPart.length;

                const localPart = text.substring(localStart, i);
                const domainPart = text.substring(i + 1, domainEnd);

                if (localPart.length > 0) {
                    const value = localPart + '@' + domainPart;
                    console.log(`  ✅ Valid: ${value}`);
                    results.push(value);
                }
            } else {
                console.log(`  ❌ Invalid TLD`);
            }
        }
    }
}

console.log(`\n\n=== RESULTS ===`);
console.log(`Found: ${results.length} emails`);
results.forEach((email, i) => console.log(`${i + 1}. ${email}`));

console.log('\n=== EXPECTED ===');
console.log('1. yavuzobuz@gmail.com');
console.log('2. gayeobuz23@hotmail.com');
console.log('3. atahanobuz@gmail.com');

if (results.length === 3 &&
    results[0] === 'yavuzobuz@gmail.com' &&
    results[1] === 'gayeobuz23@hotmail.com' &&
    results[2] === 'atahanobuz@gmail.com') {
    console.log('\n🎉 SUCCESS! All emails extracted correctly!');
} else {
    console.log('\n❌ FAIL');
}
