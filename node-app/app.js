const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  keyspace: 'stress_tntz', //'tntz',
});
const uuidv1 = require('uuid/v1');

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

let execute = true;
let mainItems = 100;
let executedItems = 0;
let executingCount = 0;
let pararalExecutions = 3;
var exec = () => {
  while (execute) {
    if (executingCount >= pararalExecutions) {
      return;
    }
    executedItems++;
    executingCount++;
    console.log(`executedItems ${executedItems}`);
    //}
    //for (i = 0; i < 3; i++) {
    let lot = uuidv1();
    console.log('lot' + lot);
    for (j = 0; j < 1; j++) {
      let gtin = uuidv1();
      for (k = 0; k < 1; k++) {
        let machine = uuidv1();
        let all_serials = [];
        for (s = 0; s < getRandomArbitrary(180000, 800000); s++) {
          all_serials.push(uuidv1());
        }
        let good_read_serial = [];
        for (s = 0; s < getRandomArbitrary(130000, 800000); s++) {
          let id = uuidv1();
          good_read_serial.push(id + ':' + uuidv1());
          if (s % 30 === 0) {
            id = uuidv1();
          }
        }
        console.log('all_serials ' + all_serials.length);
        console.log('good_read_serial ' + good_read_serial.length);

        // client
        //   .execute(
        //     'INSERT INTO job (lot, gtin, machine, all_serials, good_read_serial,bad_read_serial,distributor,end_date,expired,manufactured,operators,product_name,rejected_serial,start_date,status,unpacked_serial) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?,?, ?, ?, ?, ?,?)',
        //     [
        //       lot,
        //       gtin,
        //       machine,
        //       all_serials,
        //       good_read_serial,
        //       [],
        //       'distributor text',
        //       new Date(),
        //       new Date(),
        //       new Date(),
        //       'operators',
        //       'product_name',
        //       [],
        //       new Date(),
        //       'status',
        //       [],
        //     ]
        //   )
        //   .then(result => console.log('Data updated on cluster %s', result));

        const queries = [
          {
            query:
              'INSERT INTO job1 (lot, gtin, machine, all_serials, good_read_serial) VALUES (?, ?, ?, ?,?)',
            params: [lot, gtin, machine, all_serials, good_read_serial],
          },
        ];
        client
          .batch(queries, {
            prepare: true,
          })
          .then(result => {
            console.log('Data updated on cluster' + result);
            executingCount--;
            exec();
          })
          .catch(err => {
            executingCount--;
            // None of the changes have been applied
            console.log('Error : ' + err);
            exec();
          });
      }
    }
    if (executedItems >= mainItems) {
      execute = false;
    }
  }
};

var check = function() {
  if (executingCount >= pararalExecutions) {
    setTimeout(check, 400); // check again in a second
  } else {
    exec();
  }
};

check();
