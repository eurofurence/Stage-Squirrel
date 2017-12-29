$(document).ready(function() {
    //-- Initialize date-picker in /convention form
    $('.input-daterange, .js-convention').datepicker({
        weekStart: 1,
        forceParse: false,
        calendarWeeks: true,
        todayHighlight: true,
        format: "yyyy-mm-dd",
        startDate: "0d"
    });

    //-- Try setting up an event-handler for the open/edit buttons for
    //-- the form on the /convention page
    $('.js-open-convention-create').on('click', function() {
        if ($(this).data('action') == 'edit') {
            $('.modal-header #cid').val($(this).data('cid'));
            $('.modal-body #cname').val($(this).data('cname'));
            $('.modal-body #cdesc').val($(this).data('cdesc'));
            $('.modal-body #ctemp').val($(this).data('ctemp'));
            var stageArray = $(this).data('cstage').split(',');
            for (var stage of $('.modal-body input[name=convention_stage]')) {
                stage.checked = false;
                for (var chosenStage of stageArray) {
                    if (stage.value == chosenStage) {
                        stage.checked = true;
                    }
                }
            }
            $('.modal-body #cfrom').datepicker('update', $(this).data('cfrom'));
            $('.modal-body #cto').datepicker('update', $(this).data('cto'));
            $('.modal-footer #deletebtn')[0].style.display = 'inline-block';
            $('.modal-footer #createbtn').text('Edit');
            $('.modal-header #createtxt')[0].innerHTML = 'Edit Convention';
        } else if ($(this).data('action') == 'create') {
            $('.modal-header #cid').val('0');
            $('.modal-body #cname').val('');
            $('.modal-body #cdesc').val('');
            $('.modal-body #ctemp').val('');
            for (var stage of $('.modal-body input[name=convention_stage]')) {
                stage.checked = false;
            }
            $('.modal-body #cfrom').datepicker('update', '');
            $('.modal-body #cto').datepicker('update', '');
            $('.modal-footer #deletebtn')[0].style.display = 'none';
            $('.modal-footer #createbtn').text('Create');
            $('.modal-header #createtxt')[0].innerHTML = 'Create Convention';
        }
    });

    //-- Register/implement row-adding/removal for the create-survey/rider page
    var onRemoveRow = function() {
        var $parent = $(this).parent();
        var $grandParent = $parent.parent();
        $parent.remove();
        $grandParent.find('.increase').each(function(index) {
            $(this).text(index + 1);
        });
    }
    $('.js-remove-row').on('click', onRemoveRow);
    $('.js-add-row').on('click', function() {
        var $this = $(this);
        var $inputs = $this.prev().clone(true);
        if ($('.js-remove-row').length < 1) {
            $inputs.append(
                '<input type="button" value="x" ' +
                'class="btn btn-danger js-remove-row" />'
            );
            $inputs
                .find('.js-remove-row')
                .on('click', onRemoveRow);
        }
        var $increase = $inputs.find('.increase');
        if ($increase.length > 0) {
            $increase.text($this.parent().find('.row').length + 1);
        }
        $inputs.find('input[type!="button"], select').val('');
        $inputs.find('textarea').text('');
        $inputs.insertBefore($this);
    });

    //-- Handle click event for creat/edit buttons on the stage overview page
    $('.js-open-stage-create').on('click', function() {
        if ($(this).data('action') == 'edit') {
            $('.modal-header #cid').val($(this).data('cid'));
            $('.modal-body #cname').val($(this).data('cname'));
            $('.modal-body #cdesc').val($(this).data('cdesc'));
            $('.modal-footer #deletebtn')[0].style.display = 'inline-block';
            $('.modal-footer #createbtn').text('Edit');
            $('.modal-header #createtxt')[0].innerHTML = "Edit Stage";
        } else if ($(this).data('action') == 'create') {
            $('.modal-header #cid').val('0');
            $('.modal-body #cname').val('');
            $('.modal-body #cdesc').val('');
            $('.modal-footer #deletebtn')[0].style.display = 'none';
            $('.modal-footer #createbtn').text('Create');
            $('.modal-header #createtxt')[0].innerHTML = 'Create Stage';
        }
    });

    //-- Signup-form related event handler and actions
    $('.chosen-select').chosen();
    $('.chosen-select-deselect').chosen({ allow_single_deselect: true });
    $('.js-signup-form').on('submit', function() {
        var $this = $(this);
        var $authDoubleOptIn = $this.find('[name="auth_doubleoptin"]');
        if ($authDoubleOptIn.val() == 1) {
            var $password = $this.find('[name="password"]');
            var $password2 = $this.find('[name="password2"]');
            if ($password.val() != $password2.val()) {
                $password.focus();
                $password2.attr('title', 'The password entered does not match');
                return false;
            }
        }
        var $userRole = $this.find('[name="userrole"]');
        if ($userRole.val() == 0) {
            $userRole.focus();
            $userRole.attr('title', 'Please choose a role');
            return false;
        }
        return true;
    });
});