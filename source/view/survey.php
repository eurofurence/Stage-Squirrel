<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
    <title>Stage SQUIRREL - Survey</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="stylesheets/main.css">
	<style>
      .nopadding {
       padding: 0 !important;
       margin: 0 !important;
      }
      .noroundcorner {
        border-radius: 0 !important;
      }
    </style>
	
  </head>
  <body>
	<?php include 'header.php' ?>
    <div class="container">
      <row>
        <div class="col-lg-12">
          <form class="form-horizontal">
            <div class="panel panel-default">
              <div class="panel-heading"><strong>Tell us about your event</strong></div>
              <div class="panel-body">
                <p>Basic info up front</p>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">Your events name?</label>
                  <div class="col-sm-8">
                    <input class="form-control" id="p1_event_name" placeholder="Big Blue Dance">
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">It will take place on the:</label>
                  <div class="col-sm-8">
                    <select class="form-control" id="p1_stage">
                      <option value=""></option>
                      <option value="main">Main-Stage</option>
                      <option value="club">Club-Stage</option>
                      <option value="open">Open-Stage</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">Day of week / Date:</label>
                  <div class="col-sm-8">
                    <select class="form-control" id="p1_date">
                      <option value="">Please pick a day</option>
                      <option value="wed">Wednesday - 2017-08-16 </option>
                      <option value="thu">Thursday - 2017-08-17</option>
                      <option value="fri">Friday - 2017-08-18</option>
                      <option value="sat">Saturday - 2017-08-19</option>
                      <option value="sun">Sunday - 2017-08-20</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-7 control-label">Time you will need for setup before the actual event:</label>
                  <div class="col-sm-5">
                    <input class="form-control" id="p1_event_name" placeholder="HH:MM">
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-7 control-label">The overall duration of your event:</label>
                  <div class="col-sm-5">
                    <input class="form-control" id="p1_event_name" placeholder="HH:MM">
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-7 control-label">Time you'll need for breakdown right after the event:</label>
                  <div class="col-sm-5">
                    <input class="form-control" id="p1_event_name" placeholder="HH:MM">
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">What fits your event most?</label>
                  <div class="col-sm-8">
                    <div class="checkbox">
                      <label class="checkbox-inline"><input type="checkbox" value="Talk">Talk</label>
                      <label class="checkbox-inline"><input type="checkbox" value="Concert">Concert</label>
                      <label class="checkbox-inline"><input type="checkbox" value="Theater">Theater</label>
                      <label class="checkbox-inline"><input type="checkbox" value="Gameshow">Gameshow</label>
                      <label class="checkbox-inline"><input type="checkbox" value="Dance">Dance</label>
                      <label class="checkbox-inline"><input type="checkbox" value="Other">Other</label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">Please copy+paste your event­ description from the program</label>
                  <div class="col-sm-8">
                    <textarea class="form-control" id="p1_event_name" placeholder="Big Blue Dance"></textarea>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-4 control-label">Okay, what is really going to happen?</label>
                  <div class="col-sm-8">
                    <textarea class="form-control" id="p1_event_name" placeholder="Big Blue Dance"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading"><strong>Important contacts on your end</strong></div>
              <div class="panel-body">
                <p>Anyone we need to know about?</p>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Function</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Nick</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Mobile(int.notation)</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">E-Mail</label>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Event-Manager">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Nick">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="+1 555 123 1234">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="test@mail.org">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Event-Manager">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Nick">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="+1 555 123 1234">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="test@mail.org">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Event-Manager">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Nick">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="+1 555 123 1234">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="test@mail.org">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Event-Manager">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="Nick">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="+1 555 123 1234">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="test@mail.org">
                  </div>
                </div>
                <button class="btn btn-primary">Add row</button>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading"><strong>Do you need help?</strong></div>
              <div class="panel-body">
                <p>Do you need a hand during setup, show or breakdown? We know some volunteers who like to help on stagerelated things! (Move stuff to, on or off the stage, deco....). Aprox. no. of volunteers you need during:</p>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-3 control-label">Setup hands</label>
                  <div class="col-sm-2">
                    <input class="form-control" id="p1_event_name" placeholder="0"></textarea>
                  </div>
                  <label for="exampleInputEmail1" class="col-sm-2 control-label">to do</label>
                  <div class="col-sm-5">
                    <textarea class="form-control" id="p1_event_name"></textarea>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-3 control-label">Stage hands</label>
                  <div class="col-sm-2">
                    <input class="form-control" id="p1_event_name" placeholder="0"></textarea>
                  </div>
                  <label for="exampleInputEmail1" class="col-sm-2 control-label">to do</label>
                  <div class="col-sm-5">
                    <textarea class="form-control" id="p1_event_name"></textarea>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1" class="col-sm-3 control-label">Breakdown hands</label>
                  <div class="col-sm-2">
                    <input class="form-control" id="p1_event_name" placeholder="0"></textarea>
                  </div>
                  <label for="exampleInputEmail1" class="col-sm-2 control-label">to do</label>
                  <div class="col-sm-5">
                    <textarea class="form-control" id="p1_event_name"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading"><strong>Audio: Microphones</strong></div>
              <div class="panel-body">
                <p>Microphones: Please specify your demand on microphones provides by us</p>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Microphone type</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Application</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Nick (if known yet)</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">In fursuit?</label>
                <div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">Headset, wireless </option>
                      <option value="thu">Hand, wireless</option>
                      <option value="fri">Hand, wired</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="speaker">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">No </option>
                      <option value="thu">Yes</option>
                      <option value="fri">Yes, I know what I'm doing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">Headset, wireless </option>
                      <option value="thu">Hand, wireless</option>
                      <option value="fri">Hand, wired</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="speaker">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">No </option>
                      <option value="thu">Yes</option>
                      <option value="fri">Yes, I know what I'm doing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">Headset, wireless </option>
                      <option value="thu">Hand, wireless</option>
                      <option value="fri">Hand, wired</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="speaker">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">No </option>
                      <option value="thu">Yes</option>
                      <option value="fri">Yes, I know what I'm doing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">Headset, wireless </option>
                      <option value="thu">Hand, wireless</option>
                      <option value="fri">Hand, wired</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="speaker">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="wed">No </option>
                      <option value="thu">Yes</option>
                      <option value="fri">Yes, I know what I'm doing</option>
                    </select>
                  </div>
                </div>
                <button class="btn btn-primary">Add row</button>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading"><strong>Audio: Instruments & equipment</strong></div>
              <div class="panel-body">
                <p>?Do you bring any instruments, laptops, ipods or other kinds of eqipment that need to get on the PA?</p>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Equipment</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Connection</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Make / Model</label>
                <label for="exampleInputEmail1" class="col-xs-3 control-label">Owner (Nick)</label>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="">3,5mm TRS (Stereo)</option>
                      <option value="">3,5mm TS (Mono)</option>
                      <option value="">6,35mm TRS (Stereo)</option>
                      <option value="">6,35mm TS (Mono)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">Analog-XLR</option>
                      <option value="">AES-XLR</option>
                      <option value="">I don't know</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="">3,5mm TRS (Stereo)</option>
                      <option value="">3,5mm TS (Mono)</option>
                      <option value="">6,35mm TRS (Stereo)</option>
                      <option value="">6,35mm TS (Mono)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">Analog-XLR</option>
                      <option value="">AES-XLR</option>
                      <option value="">I don't know</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="">3,5mm TRS (Stereo)</option>
                      <option value="">3,5mm TS (Mono)</option>
                      <option value="">6,35mm TRS (Stereo)</option>
                      <option value="">6,35mm TS (Mono)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">Analog-XLR</option>
                      <option value="">AES-XLR</option>
                      <option value="">I don't know</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                </div>
                <div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <select class="form-control" id="p1_date">
                      <option value="">-</option>
                      <option value="">3,5mm TRS (Stereo)</option>
                      <option value="">3,5mm TS (Mono)</option>
                      <option value="">6,35mm TRS (Stereo)</option>
                      <option value="">6,35mm TS (Mono)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">2x 6,35mm TS (L+R)</option>
                      <option value="">Analog-XLR</option>
                      <option value="">AES-XLR</option>
                      <option value="">I don't know</option>
                    </select>
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                  <div class="col-xs-3 nopadding">
                    <input class="form-control noroundcorner" id="p1_event_name" placeholder="">
                  </div>
                </div>
                <button class="btn btn-primary">Add row</button>
              </div>
            </div>
          </div>
        </form>
      </row>
    </div>
	</div>
    <script src="http://code.jquery.com/jquery.js"></script>
  </body>
</html>