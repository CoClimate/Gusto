var Quiz, Popup;

(function ($) {
    "use strict";

    Quiz = function () {
        this.options = {
            sectionPrefix: "section_",
            sectionClass: "section",
            sectionTabs: "nav_item",

            subsectionClass: "subsection",
            subsectionTabs: "subnav_items",
            contentClass: 'section-content',

            examples_list: 'examples_list'
        };

        var self = this;

        this.sections = [/*'home', */'basics', 'core', 'behavior', 'numbers', 'risk', 'score'];

        this.currentSection = null;
        this.currentSubsection = null;
        this.materialType = null;

        this.score = [0, 0];
        this.questions = {
            core: {
                questions: [
                    {
                        /* nothing here - unscored */
                    },
                    {
                        heading: "Does the material contain one main message statement?",
                        subheading: "<div class='left-pad'><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>A main message is the one thing you want to communicate to a person or group that they must remember. A topic, such as severe weather or climate change, isn’t a main message statement. </li><li>The statement may be 1-3 short sentences</li></ul><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The material contains several messages, and there is no obvious main message</li></ul></div>",
                        example: "#question_1",
                        afterCreate: function (subsection) {
                            $(subsection).find(".yes_no-no").click(function () {
                                var warning = $(subsection).find('.warning');
                                var skipTo = $($('#section_core .subsection')[0]).data("skipTo");
                                if(skipTo){
                                    warning.text(warning.text().replace(/4/g,""+(skipTo-1)).replace(/5/g,""+(skipTo)));
                                }
                                warning.insertBefore($(subsection).find('.question-comment-wrapper')).show();
                            });

                            $(subsection).find(".yes_no-yes").click(function () {
                                var warning = $(subsection).find('.warning');
                                warning.insertBefore($(subsection).find('.question-comment-wrapper')).hide();
                            });
                        },
                        afterScore: (function () {                           
                            return function (question, answer) {
                                question = question || null;
                                var skipTo = $($('#section_core .subsection')[0]).data("skipTo") || 5;
                                if (parseInt(answer.a, 10) === 0) {
                                    var i,
                                        subsections;

                                    for (i = 2; i < skipTo; i += 1) {
                                        self.nextSubsection(null, null, true);
                                        subsections = $(self.getSection()).find('.subsection');
                                        $(subsections[i]).find(".yes_no-no").attr('checked', 'checked');
                                    }

                                    self.checkAnswer(true);
                                }
                            };
                        }())
                    },
                    {
                        heading: "Is the main message at the top, beginning, or front of the material?",
                        subheading: "<div class='left-pad'><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The main message is in the first paragraph or section. A section is a block of text between headings. </li><li>For a Web material, the first section must be fully visible without scrolling </li></ul></div>",
                        example: "#question_2"
                    },
                    {
                        heading: "Is the main message emphasized with visual cues?",
                        subheading: "<div class='left-pad'><p><strong class='label label-danger'>Answer yes if:</strong></p><ul><li>The main message is emphasized with a clear font, color, shapes, lines, arrows or headings</li></ul></div>",
                        example: "#question_3"
                    },
                    {
                        heading: "Does the material contain at least one image or visual that conveys or supports the main message?",
                        subheading: "<div class='left-pad'><p>Count photographs, line drawings, cartoons, videos, and infographics as visuals.</p><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The visual does not include people or human-scale tools and surroundings</li><li>Inauthentic stock images are used</li><li>The visual doesn&rsquo;t have a caption or labels</li><li>The visual has people who aren&rsquo;t performing the recommended practices</li></ul></div>",
                        example: "#question_4"
                    },
                    {
                        heading: "Does the material include one or more specific calls to action for the primary audience?",
                        subheading: "<div class='left-pad'><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material includes a recommendation for a specific practice, a shift to existing practices, a prompt to get more information, a request to share information with someone else, or a call for a specific program or policy change</li></ul></p><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The call to action is for someone other than the primary audience</li><li>The call to action is vague or beyond the scope of what the audience can reasonably contribute to</li></ul></div>",
                        example: "#question_5"
                    },
                    {
                        heading: "Do both the main message and the call to action use the active voice and third-person?",
                        subheading: "<div class='left-pad'><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>Only the main message or only the call to action uses the active voice</li><li>Only the main message or only the call to action uses second-person</li></ul></div>",
                        example: "#question_6",
                        afterCreate: function (subsection) {
                            var q1 = parseInt(self.answers.core[1].a, 10) === 0,
                                q2 = parseInt(self.answers.core[5].a, 10) === 0;

                            if (q1 || q2) {
                                $(subsection).find('input.yes_no-no').attr({checked: true});
                                $(subsection).find("input:radio").attr('disabled', true);
                                $(subsection).find(".next_button").removeClass("btn-default").addClass("btn-success");
                                if ($(subsection).find('.alert').length === 0) {
                                    $('<div class="alert alert-info warning top-spacing bottom-spacing inside" style=""><h4>Scoring Notes</h4><p>Because you answered no on questions 1 or 5, this question will be scored as "no"</p></div>').insertBefore($(subsection).find('.question-comment-wrapper'));
                                }
                            } else {
                                $(subsection).find('.alert').remove();
                                $(subsection).find("input:radio").attr('disabled', false);
                                $(subsection).find(".next_button").removeClass("btn-success").addClass("btn-default");
                            }
                        }
                    },
                    {
                        heading: "Does the material <u>always</u> use words, phrasings, metaphors and idioms the primary audience uses? ",
                        subheading: "<div class='left-pad'><p>Acronyms and abbreviations must be spelled out and explained if unfamiliar to the audience.</p><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>All specialized or unfamiliar terms are explained or described (not just defined) the first time they are used</li><li>Metaphors are consistent with the audiences' prior experiences</li></ul></div>",
                        example: "#question_7"
                    },
                    {
                        heading: "Does the material use bulleted or numbered lists?",
                        subheading: "<div class='left-pad'><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material contains a list with 3 to 5 items</li><li>The list is broken up into sub-lists if there are more than 7 items</li><li>The list is not for additional information or references only or at the end of the material</li></ul></div>",
                        example: "#question_8"
                    },
                    {
                        heading: "Is the material organized in chunks with headings?",
                        subheading: "<div class='left-pad'><p>This item applies to prose text and lists.</p><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The chunks do not reinforce the main message</li><li>The chunks contain more than one idea each</li><li>The headings don&rsquo;t match the information chunks</li></ul></div>",
                        example: "#question_9"
                    },
                    {
                        heading: "Is the most important information the primary audience needs summarized in the first paragraph or section?",
                        subheading: "<div class='left-pad'><p>The most important information must include the main message. A section is a block of text between headings.</p> <p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>For Web material: the first section must be fully visible without scrolling</li><li>For Audio material: the most important information is not repeated to remind listeners</li><li>For Visual material: the most important information does not have a strong visual hierarchy</li></ul></div>",
                        example: "#question_10",
                        afterCreate: function (subsection) {
                            var q1 = parseInt(self.answers.core[1].a, 10) === 0;

                            if (q1) {
                                $(subsection).find('input.yes_no-no').attr({checked: true});
                                $(subsection).find("input:radio").attr('disabled', true);
                                $(subsection).find(".next_button").removeClass("btn-default").addClass("btn-success");
                                if ($(subsection).find('.alert').length === 0) {
                                    $('<div class="alert alert-info warning top-spacing bottom-spacing inside" style=""><h4>Scoring Notes</h4><p>Because you answered no on question 1, this question will be scored as "no"</p></div>').insertBefore($(subsection).find('.question-comment-wrapper'));
                                }
                            } else {
                                $(subsection).find('.alert').remove();
                                $(subsection).find("input:radio").attr('disabled', false);
                                $(subsection).find(".next_button").removeClass("btn-success").addClass("btn-default");
                            }
                        }
                    },
                    {
                        heading: "Does the material explain what authoritative sources, such as subject matter experts and agency spokespersons, know and don\'t know about the topic?",
                        subheading: "<div class='left-pad'><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material addresses both</li></ul><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The material addresses only one (what is known or not known)</li></ul></div>",
                        example: "#question_11"
                    },
                    {
                        /* nothing here - unscored */
                    }

                ],
                answers: [null, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            behavior: {
                questions: [
                    {
                        /* nothing here - unscored */
                    },
                    {
                        heading: "Does the material include one or more practical recommendations for the primary audience?",
                        subheading: "",
                        example: "#question_12",
                        afterCreate: function (subsection) {
                            $(subsection).find(".yes_no-yes").attr('checked', true).click(function () {
                                $(subsection).find('.info-message').insertBefore($(subsection).find('.question-comment-wrapper')).css({display: 'block'})
                                $(subsection).find('.warning-message').css({display: 'none'});
                            });

                            $(subsection).find(".yes_no-no").click(function () {
                                $(subsection).find('.info-message').css({display: 'none'});
                                $(subsection).find('.warning-message').insertBefore($(subsection).find('.question-comment-wrapper')).css({display: 'block'});
                            });

                            $(subsection).find('.info-message').insertBefore($(subsection).find('.question-comment-wrapper')).css({display: 'block'});
                            $(subsection).find('.warning-message').css({display: 'none'});
                        },
                        afterScore: (function (self) {
                            return function (question, answer) {
                                question = question || null;
                                if (parseInt(answer.a, 10) === 0) {
                                    self.skipSection();
                                }
                            };
                        }(this))
                    },
                    {
                        heading: "Does the material explain why the practices are important and meaningful to the primary audience?",
                        subheading: "<div class='left-pad'><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>Only numbers are used to convey importance with no other relevant information for the audience</li><li>You do not describe how the practices help fulfill the audience's goals or aspirations, </li></ul></div>",
                        example: "#question_13"
                    },
                    {
                        heading: "Do the recommendations include specific directions about how to acquire new practices or perform existing ones?",
                        subheading: "<div class='left-pad'><p>This may include step-by-step directions, demonstrations, or a simple description (for example: Look for times of day when the electricity grid is using less fossil fuel-generated power).</p><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material includes information about when, where, and how to find out more information</li><li>The material mentions when, where, and how to shift, adjust, transform existing behaviors and practices</li></ul></div>",
                        example: "#question_14"
                    },
                    {
                        /* nothing here - unscored */
                    }
                ],
                answers: [null, 1, 1, 1]
            },
            numbers: {
                questions: [
                    {
                        /* nothing here - unscored */
                    },
                    {
                        heading: "Does the material <u>always</u> present numbers the primary audience uses?",
                        subheading: "<ul><li>Many audiences find numbers and statistics distracting or confusing. Make sure the numbers in the material are both familiar and necessary to support or explain the main message statement. If not, delete the numbers. </li><li>Whole numbers are used by most audiences. The types of numbers used will vary for each audience.</li></ul>",
                        example: "#question_15"
                    },
                    {
                        heading: "Does the material <u>always</u> explain what the numbers mean?",
                        subheading: "<div class='left-pad'><p>Provide reasons why the numbers in the material are important to the topic and the audience's understanding of the information.</p><p>To help people make sense of numbers, present them in context. For example, translate large numbers into per hour or per minute comparisons. Compare a statistic with a well-known place for a sense of magnitude. Use local or regional data for relevance, rather than state or national statistics. Compare and contrast numbers with familiar things from everyday life, or use stark juxtapositions to highlight to needs or priorities. </p></div>",
                        example: '#question_16'
                    },
                    {
                        heading: "Does the audience have to conduct mathematical calculations?",
                        subheading: "Adding, subtracting, multiplying, and dividing involve calculations. Calculating a common denominator for the purposes of comparison is a mathematical calculation. Use the same denominator, even for absolute risk (1 out of 3), throughout the material so that audiences don’t have to calculate or translate comparisons. <br /><br /><strong>NOTE: This is the only Index item that gives the material a point if the answer is No.</strong>",
                        example: "#question_17"
                    },
                    {
                        /* nothing here - unscored */
                    }
                ],
                answers: [null, 1, 1, 0]
            },
            risk: {
                questions: [
                    {
                        /* nothing here - unscored */
                    },
                    {
                        heading: "Does the material explain the nature of the risk or uncertainty?",
                        subheading: "<div class='left-pad'><p class='tighten-line'><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material focuses on what is known and how remaining uncertainty is being addressed.</li><li>The material states the threat or harm and how and why people may or may not be affected</li></ul></div><div class='left-pad'><p class='tighten-line'><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The material does not confidently acknowledge uncertainty</li><li>The material has only the threat or harm but no explanation or neglects to provide tangible steps that people can take</li></ul></div><div class='left-pad'><p class='smaller'>For example, if the material states there are 1,000 new cases of a contagious disease in Springfield, does it also state that people in Springfield may be more likely to get the disease, why they may be more likely, and how serious the threat of the disease is?</p></div>",
                        example: "#question_18"
                    },
                    {
                        heading: "Does the material address both the risks and benefits of recommended practices?",
                        subheading: "<div class='left-pad'><p>This includes actual risks and benefits as well as those perceived by your audience.</p><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The material addresses only risks or only benefits</li></ul><p><strong class='label label-default'>Answer not applicable (N/A) if:</strong></p><ul><li>No practical recommendations are presented</li></ul></div>",
                        example: "#question_19",
                        hasNA: true,
                        afterCreate: function (subsection) {
                            var skipBehavior = $('div#section_behavior div.subsection:first input.yes_no-no:checked')[0] != null;
                            if (skipBehavior) {
                                $(subsection).find('input#yes_no-na').attr({checked: true});
                                $(subsection).find("input:radio").attr('disabled', true);
                                $(subsection).find(".next_button").removeClass("btn-default").addClass("btn-success");
                                if ($(subsection).find('.alert').length === 0) {
                                    $('<div class="alert alert-info warning top-spacing bottom-spacing inside" style=""><h4>Scoring Notes</h4><p>Because you answered no to the intro question in Part B, this question will be scored as "N/A".</p></div>').insertBefore($(subsection).find('.question-comment-wrapper'));
                                }
                            } else {
                                $(subsection).find('.alert').remove();
                                $(subsection).find("input:radio").attr('disabled', false);
                                $(subsection).find(".next_button").removeClass("btn-success").addClass("btn-default");
                            }
                        }
                    },
                    {
                        heading: "Does the material use multiple and mixed approaches to describe risk? If the material uses numeric probability or statistic to describe risk, is it also explained with words or a visual?",
                        subheading: "<div class='left-pad'><p>Examples of probability information in a risk message are numbers (such as 1 in 5 or 20%). People may not interpret estimates or words in the same way. A large risk to one person may be a small risk to someone else.</p><p><strong class='label label-success'>Answer yes if:</strong></p><ul><li>The material presents numeric risk and also uses text or visuals to explain the probability</li><li>The material uses multiple labels: 90% and very likely and often and probable<li>The material avoids negative labels like “unlikely”</li></ul></p><p><strong class='label label-danger'>Answer no if:</strong></p><ul><li>The material only presents numeric risk</li><li>The material describes risk using only one word or description</li></ul></p><p><strong class='label label-default'>Answer not applicable (N/A) if:</strong></p><ul><li>The material does not include this type of probability information</li></ul></div>",
                        example: "#question_20",
                        hasNA: true
                    },
                    {
                        /* nothing here - unscored */
                    }
                ],
                answers: [null, 1, 1, 1]
            }
        };

        this.answers = {
            basics: [],
            core: [],
            behavior: [],
            numbers: [],
            risk: []
        };

        this.basic_answers = {};

        this.currentSection = $(".section.active")[0];
        this.currentSubsection = $('.subsection.active')[0];

        if (this.options.examples_list !== null) {
            this.examples = $("#" + this.options.examples_list);
        }
    };

    Quiz.prototype.tallyScore = function () {
        this.score = [0, 0];
        var x, score, percentage, className,
            progress = $(".total_progress");
        for (x in this.questions) {
            if (this.questions[x] !== undefined) {
                score = this.tallySection(x);
                this.score[0] += score[0];
                this.score[1] += score[1];
            }
        }

        progress.find('.progress-bar-success').css({width: ((this.score[0] / this.score[1]) * 100) + "%"});
        progress.find('.progress-bar-danger').css({width: (((this.score[1] - this.score[0]) / this.score[1]) * 100) + "%"});

        percentage = (((this.score[0] / this.score[1]) * 100) | 0);
        className = percentage > 60 ? (percentage > 80 ? 'correct-answer' : 'meh-answer') : 'wrong-answer';

        $('.total-total-score').text(this.score.join( " / "))
        $('.total_total_score').text(this.score.join( " out of "))
        $(".total_correct").text(percentage + "%")
            //.removeClass('correct-answer')
            //.removeClass('wrong-answer')
            //.removeClass('meh-answer')
            //.addClass(className);

        $('.grade-d, .grade-c, .grade-b, .grade-a').hide();

        if (percentage < 50) {
            $('.grade-d').show();
        } else if (percentage >= 50 && percentage < 90) {
            $('.grade-c').show();
        } else if (percentage >= 90 && percentage < 100) {
            $('.grade-b').show();
        } else if (percentage === 100 || percentage === "N/A") {
            $('.grade-a').show();
        }

        //console.log(this.score)
    };

    Quiz.prototype.tallySection = function (key) {
        var section = this.questions[key],
            questions = section.questions,
            answers = this.answers[key],
            score = [0, 0],
            i,
            answer;

        for (i = 0; i < questions.length; i += 1) {
            answer = answers[i];
            if (answer !== undefined && answer.a !== undefined) {
                if (answer.a !== "NA") {
                    score[1] += 1;
                    if (answer.a == section.answers[i]) score[0] += 1;
                } else {
                    //console.log('Answer is NA')
                }
            }
        }


        var progress = $("." + key + "_progress");
        progress.find('.progress-bar-success').css({width: ((score[0] / score[1]) * 100) + "%"});
        progress.find('.progress-bar-danger').css({width: (((score[1] - score[0]) / score[1]) * 100) + "%"});

        if (score[1] !== 0) {
            var percentage = (((score[0] / score[1]) * 100) | 0) + '%',
                className = percentage > 60? (percentage > 80? 'correct-answer': 'meh-answer'): 'wrong-answer';
        } else {
            var percentage = 'N/A',
                className = 'correct-answer';
        }

        $('.' + key + '_total-score').text(score.join( " / "))
        $("." + key + "_total_correct").text(score[0] + " out of " + score[1])
        $("#" + key + "_correct, #" + key + "_total_correct").text(percentage)
            .removeClass('correct-answer')
            .removeClass('wrong-answer')
            .removeClass('meh-answer')
            .addClass(className);

        return score;
     }

    Quiz.prototype.answerBasic = function (id, value) {
        this.basic_answers[id] = value;
    };

    Quiz.prototype.nextSubsection = function (reverse, index, skipException) {
        var hasAnswer = this.checkAnswer(skipException);
        if (!hasAnswer && !reverse) {
            this.showError();
            return;
        } else {
            $('.subsection.active').find('.regular-error-message').css({visibility: 'hidden'})
        }

        var section = this.getSection(),
            subsections = $(section).find("." + this.options.subsectionClass),
            subsection = this.currentSubsection === null? subsections[0]: this.currentSubsection,
            subsectionIndex = $.inArray(subsection, subsections),
            newIndex = (index || index === 0)? index: reverse? subsectionIndex - 1: subsectionIndex + 1;
        if($(section).attr('id') === 'section_basics' && newIndex === 1){
            this.answerBasic('7',$('#basic-q1-2').val());
        }
        if (!subsections[newIndex]) {
            this.nextSection(reverse);
            return;
        } else {
            this.currentSection = section;
            this.currentSubsection = subsections[newIndex];
        }

        this.switchSubsection();
    };

    Quiz.prototype.nextSection = function (reverse, index) {
        var section = this.getSection(),
            sections = $('.' + this.options.sectionClass),
            sectionIndex = $.inArray(section, sections),
            newIndex = index !== void 0? index: (reverse? sectionIndex - 1: sectionIndex + 1);
        
        //if moving to core section, clear out irrelavent questions
        if(newIndex === 1 && !$('#section_basics').hasClass("irrQuestionsRemoved")){
            this.removeIrrelaventQuestions();
        }
        
        if (!index) $("." + this.options.sectionTabs + ":eq(" + (newIndex + 1) + ")").addClass('completed');
        if (!sections[newIndex]) return;

        this.currentSection = sections[newIndex];

        var subsections = $(this.currentSection).find('.' + this.options.subsectionClass),
            subsectionIndex = reverse? subsections.length - 1: 0;

        this.currentSubsection = subsections[subsectionIndex];
        this.switchSubsection();
    };
    
    Quiz.prototype.removeQuestion = function(index,section){
        var newIndex = index - this.numRemoves[section];
        console.log("Removing index " + newIndex + " in the " + section + " section");
        this.questions[section].questions.splice(newIndex,1);
        this.questions[section].answers.splice(newIndex,1);
        $($('#section_'+section+' .subsection')[newIndex]).remove();
        $($('#'+section+'_tab li')[newIndex]).remove();
        this.numRemoves[section]++;
    };
    
    Quiz.prototype.convertToIndex = function(num){
        var index = num;
        if(num > 11 && num < 15){
            index = num - 11; 
        } else if (num > 14 && num < 18){
            index = num - 14;
        } else if (num > 17 && num < 21){
            index = num - 17;
        }
        return index;
    };
    
    Quiz.prototype.getSectionIdentifier = function(num){
        var section = "core";
        if(num > 11 && num < 15){
            section = "behavior"; 
        } else if (num > 14 && num < 18){
            section = "numbers";
        } else if (num > 17 && num < 21){
            section = "risk";
        }
        return section;
    };
    
    Quiz.prototype.removeIrrelaventQuestions = function() {
        //Determines which questions are relevant based on selection on first page
        //The logic for this section is dependent on the number of questions in the quiz and will need to be reworked if any questions are added or removed
        //Questions 0 and 12 are the intro and score sections and must be included for logic to work
        //Numbers must be in numerical order from lowest to highest
        var irrelaventQuestions = [];
        this.numRemoves = {
            core: 0,
            behavior: 0,
            numbers: 0,
            risk: 0
        };
        
        switch(this.basic_answers['7']){
            case 'Facebook and SocialMedia':
                irrelaventQuestions = [                   
                    {number: 3, status: "remove"},
                    {number: 4, status: "remove"},                   
                    {number: 8, status: "remove"},
                    {number: 9, status: "remove"},                
                    {number: 11, status: "remove"},               
                    {number: 14, status: "remove"},
                    {number: 16, status: "remove"}                   
                ];
                break;
            case 'Speeches and Podcasts':
                irrelaventQuestions = [
                    {number: 2, status: "n/a"},
		    {number: 10, status: "n/a"},
                    {number: 3, status: "remove"},
                    {number: 4, status: "remove"},                   
                    {number: 8, status: "remove"},
                    {number: 9, status: "remove"},
                    {number: 11, status: "remove"},                 
                    {number: 14, status: "remove"},
                    {number: 16, status: "remove"}
                ];
                break;
           case 'Images and Infographics':
                irrelaventQuestions = [
                    {number: 2, status: "n/a"},
                    {number: 3, status: "remove"},
                    {number: 4, status: "remove"},                   
                    {number: 8, status: "remove"},
                    {number: 9, status: "remove"},
                    {number: 10, status: "remove"},
                    {number: 11, status: "remove"},
                    {number: 14, status: "remove"},
                    {number: 16, status: "remove"}
                ];
                break;
            case 'Short Headlines and Twitter':
                irrelaventQuestions = [
                    {number: 2, status: "remove"},
                    {number: 3, status: "remove"},
                    {number: 4, status: "remove"},                   
                    {number: 8, status: "remove"},
                    {number: 9, status: "remove"},
                    {number: 10, status: "remove"},
                    {number: 11, status: "remove"},
                    {number: 13, status: "remove"},
                    {number: 14, status: "remove"},
                    {number: 16, status: "remove"},
                    {number: 19, status: "remove"},
                    {number: 20, status: "remove"}
                ];
                break;
        }
        var skipTo = 5;
        for (var i = 0; i < irrelaventQuestions.length; i++){
            if(irrelaventQuestions[i].status === "remove"){
                this.removeQuestion(this.convertToIndex(irrelaventQuestions[i].number),this.getSectionIdentifier(irrelaventQuestions[i].number));
                if(irrelaventQuestions[i].number === 2 || irrelaventQuestions[i].number === 3 || irrelaventQuestions[i].number === 4){
                    skipTo--;
                }
            } else if (irrelaventQuestions[i].status === "n/a"){
                this.questions[this.getSectionIdentifier(irrelaventQuestions[i].number)].questions[this.convertToIndex(irrelaventQuestions[i].number)].hasNA = true;
            }
        }
        $($('#section_core .subsection')[0]).data("skipTo",skipTo);
        
                
        /*old method for removing
        switch(this.basic_answers['7']){
            case 'ShortAndOral':
                relaventQuestions = [0,1,2,5,6,7,10,12];
                break;
            case 'PrintAndWeb':
                relaventQuestions = [0,1,2,3,4,5,6,7,8,9,10,11,12];
                break;
        }
        
         
        var index = 0;
        var num;
        var skipTo = 5;
        for(var questionNum = 0; questionNum < 12; questionNum++){
            if(relaventQuestions[index] === questionNum){
                index++;
            }
            else {
                this.questions['core'].questions.splice(index,1);
                this.questions['core'].answers.splice(index,1);
                $($('#section_core .subsection')[index]).remove();
                $($('#core_tab li')[index]).remove();
                if(questionNum === 2 || questionNum === 3 || questionNum === 4){
                    skipTo--;
                }
            }
        }
        $($('#section_core .subsection')[0]).data("skipTo",skipTo);*/
        
        //renumbers rest of questions
        
        //renumbers core questions
        console.log("Core Length: " +this.questions['core'].questions.length);
        console.log("Behavior Length: " +this.questions['behavior'].questions.length);
        console.log("Numbers Length: " +this.questions['numbers'].questions.length);
        console.log("Risk Length: " +this.questions['risk'].questions.length);
        
        var total = 0;  
        for(var index = 1; index < this.questions['core'].questions.length -1; index++){
            $($('#core_tab li a')[index]).text("" + index);
            this.questions['core'].questions[index].indexNum = index;
            console.log("Renumbering index " + index + " in the core section to say " + index);
        }
        //$($('#core_tab li a')[index]).text("Score");
        //this.questions['core'].questions[index] = {};
        total += (this.questions['core'].questions.length - 2);
        //renumbers behavior questions 
        for(index = 1; index < this.questions['behavior'].questions.length -1; index++){
            $($('#behavior_tab li a')[index]).text("" + (total + index));
            this.questions['behavior'].questions[index].indexNum = total + index;
            console.log("Renumbering index " + index + " in the behavior section to say " + (total+index));
        }
        ////$($('#behavior_tab li a')[index]).text("Score");
        //this.questions['core'].questions[index] = {};
        total += (this.questions['behavior'].questions.length - 2);
        //renumbers number questions 
        for(index = 1; index < this.questions['numbers'].questions.length -1; index++){
            $($('#numbers_tab li a')[index]).text("" + (total + index));
            this.questions['numbers'].questions[index].indexNum = total + index;
            console.log("Renumbering index " + index + " in the number section to say " + (total+index));
        }
        //$($('#numbers_tab li a')[index]).text("Score");
        //this.questions['core'].questions[index] = {};
        total += (this.questions['numbers'].questions.length - 2);
        //renumbers risk questions 
        for(index = 1; index < this.questions['risk'].questions.length -1; index++){
            $($('#risk_tab li a')[index]).text("" + (total + index));
            this.questions['risk'].questions[index].indexNum = total + index;
            console.log("Renumbering index " + index + " in the number section to say " + (total+index));
        }
        //$($('#risk_tab li a')[index]).text("Score");
        //this.questions['core'].questions[index] = {};
        total += (this.questions['risk'].questions.length - 2);
        $('#section_basics').addClass("irrQuestionsRemoved");
    };
    
    Quiz.prototype.skipSection = function () {
        this.blankSection();
        this.nextSection(false);
    };

    Quiz.prototype.blankSection = function () {
        var section = this.sections[this.getSectionIndex()];
        this.answers[section] = [];
        $('#'+section+'_score .final_question_score').empty();
        $('#section_'+section+' .pagination li').removeClass('completed');
        this.tallySection(section);
    }

    Quiz.prototype.prevSubsection = function () {
        this.nextSubsection(true);
    };

    Quiz.prototype.prevSection = function () {
        this.nextSection(true);
    };

    Quiz.prototype.getSection = function () {
        if (this.currentSection === null) {
            return $("." + this.options.sectionClass)[0];
        } else {
            return this.currentSection;
        }
    };

    Quiz.prototype.getSectionIndex = function () {
        var section = this.getSection(),
            sections = $('.' + this.options.sectionClass);       
        return $.inArray(section, sections);
    };

    Quiz.prototype.getSubsectionIndex = function () {
        var section = this.getSection(),
            subsections = $(section).find("." + this.options.subsectionClass),
            subsection = this.currentSubsection === null? subsections[0]: this.currentSubsection;
        return $.inArray(subsection, subsections);
    };

    Quiz.prototype.switchSubsection = function () {
        $('.active').removeClass('active');
        $(this.currentSubsection).addClass('active');
        $(this.currentSection).addClass('active');

        $('a[href=#'+this.sections[this.getSectionIndex()]+"]").tab('show');
        $(this.currentSection).find('.pagination li:eq(' + (this.getSubsectionIndex()) + ')').addClass('active completed');
        if (!$(this.currentSubsection).hasClass('unscored')) {
            this.createQuestion();

            $(this.currentSubsection).find('.example').hide();
            $(this.currentSubsection).find('.show-example').text('Show Example').removeClass('example-active');
        }

        this.tallyScore();

        $('#skip_nav').attr({id: ""})
        $(".subsection.active .skip_nav_button").attr({id: "skip_nav"})
        try{
            tabManager.reset(tabOptions);
        } catch(e) {
            //There is no tabManager
        }
    };

    Quiz.prototype.showError = function () {
        $('.subsection.active').find('.regular-error-message').css({visibility: 'visible'})
    }

    Quiz.prototype.createQuestion = function (type) {
        var section = this.sections[this.getSectionIndex()],
            index = this.getSubsectionIndex(),
            self = this;

        if (this.questions[section]) {
            var question = this.questions[section].questions[index];
        } else {
            return;
        }

        if (type == 'text') {
            return 'whatever';
        } else {
            if ($(".section .subsection.active").find('form').length > 0) {
                if (question.afterCreate !== void 0) question.afterCreate($(".section .subsection.active")[0])
                    return
            }
            var content = $(".section .active").find("." + this.options.contentClass).empty().append(
                    "<a href='#' class='skip_nav_button'>&nbsp</a>"
                ).append(
                    $("<form class='form standard-question'></form>").append(
                        "<div class='fieldset'><h2 class='col-sm-12 fake-h4'>" + "<span class='item-number'>" + question.indexNum + ".</span> " + question.heading + "</h2></div><p class='col-sm-12'>" + question.subheading + "</p>"
                ).append(
                    $("<div class='form-group col-sm-8'></div>").append(
                        $("<div class='radio-inline " + (question.hasNA ? "col-sm-4" : "col-sm-6") + "'><label><input type='radio' class='answer yes_no-yes' name='yes_no' value='1' />Yes</label></div>")
                            .change(function () {$(self.currentSubsection).find('.next_button').removeClass('btn-default').addClass('btn-success')})
                    ).append(
                        $("<div class='radio-inline " + (question.hasNA ? "col-sm-4" : "") + "'><label><input type='radio' class='answer yes_no-no' name='yes_no' value='0' />No</label></div>")
                            .change(function () {$(self.currentSubsection).find('.next_button').removeClass('btn-default').addClass('btn-success')})
                    ).append(
                        (function () {
                            if (question.hasNA) {
                                return $("<div class='radio-inline'><label><input type='radio' class='answer' name='yes_no' id='yes_no-na' value='NA' />N/A</label></div>")
                                    .change(function () {$(self.currentSubsection).find('.next_button').removeClass('btn-default').addClass('btn-success')})
                            } else {
                                return "";
                            }
                        })()
                    ).append(
                        "<div class='regular-error-message' style='visibility:hidden;'><small>Please answer this question to continue.</small></div>"
                    )
                ).append(
                    $("<div class='col-sm-4 align-right'></div>").append(
                        $("<a class='btn btn-info show-example' href='#'>Show Example</a>").click(function () {
                            var form = $(this).parents('form');

                            if ($(this).hasClass('example-active')) {
                                $(this).text('Show Example').removeClass('example-active');
                                form.find('.example').hide();
                            } else {
                                $(this).text('Hide Example').addClass('example-active');
                                form.find('.example').show();
                            }
                        }).on('keyup', function (e) {
                            if (e.keyCode == 13) $(this).trigger('click')
                        })
                    )
                ).append(
                    $("<div class='col-sm-12 example padded-top' style='display: none;'></div>").append(
                        this.examples.find(question.example).clone()
                    )
                ).append(
                    $("<div class='col-sm-12 question-comment-wrapper'></div>").append(
                        $("<label for='notes_" + question.indexNum  + "'>My Item " + question.indexNum  + " Notes:</label><h4 class='flatten'><small>You will see all of your saved notes on the Final Score page.</small></h4><textarea id='notes_" + question.indexNum  + "' class='form-control question-comment'></textarea>")
                    )
                )
            );

            if (question.afterCreate && typeof question.afterCreate == 'function') {
                //console.log($(".section .subsection.active")[0]);
                question.afterCreate($(".section .subsection.active")[0]);
            }
        }
    };

    Quiz.prototype.getPaginationOffset = function () {
        var offset = $(this.currentSection).find('.subsection').length - $(this.currentSection).find('.pagination li').length;
        return offset;
    };

    Quiz.prototype.checkAnswer = function (skipException) {
        var section = this.sections[this.getSectionIndex()],
            index = this.getSubsectionIndex(),
            form = $(".section .active").find('form'),
            self = this;

        if (!form[0] || form.hasClass('ignore-me')) {
            if (section == 'basics') {
                var inputs = $(".subsection.active input, .subsection.active textarea, .subsection.active select");
                if (inputs.length > 0) {
                    var complete = true;
                    inputs.each(function(item) {
                        if ($.trim($(this).val()) === "") {
                            complete = false;
                            $(this).parents('.subsection').find('.container').addClass('has-error');
                            $(this).parents('.subsection').find('.error-message').css({visibility: 'visible'});
                        } else {
                            $(this).parents('.subsection').find('.container').removeClass('has-error');
                            $(this).parents('.subsection').find('.error-message').css({visibility: 'hidden'});
                        }
                    });

                    return complete;
                } else {
                    return true;
                }
            } else {
                if (form.hasClass('ignore-me') && $('.subsection.active input[type=radio]').length > 0 && $('.subsection.active input[type=radio]:checked').length === 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        var answer = form.find('input:radio[name=yes_no]:checked').val();
        if (answer === void 0) {
            return false;
        } else {
            this.answers[section][index] = {
                a: answer,
                c: form.find('.question-comment').val()
            };

            if (this.questions[section]){
                var question = this.questions[section].questions[index];
                $(question.example.replace("#", ".") + "_score").empty().append(
                    $("<h4>Item " + question.indexNum  + ": " + question.heading + "</h4>").click(function () {
                        self.nextSection(false, self.sections.indexOf(section));
                        self.nextSubsection(true, index);
                    })
                ).append(
                    (function () {
                        var correct = self.answers[section][index].a == self.questions[section].answers[index]

                        if (self.answers[section][index].a == 'NA') {
                            return "<h5>Your Answer: N/A</h5>";
                        } else {
                            return "<h5>Your Answer: " + (self.answers[section][index].a == 1? "Yes": "No") + " " + (correct? "<span class='glyphicon glyphicon-ok-circle correct-answer'></span>": "<span class='glyphicon glyphicon-remove-circle wrong-answer'></span>") + " = " + (correct ? 1 : 0) + " point" + (correct ? '' : 's') + "</h5>";
                        }
                    })()
                ).append(
                    ($.trim(this.answers[section][index].c) === "" ? "" :
                        $("<div></div>").append(
                            "<h5>Notes on Item " + question.indexNum  + ":</h5>"
                        ).append(
                            "<p class='indented'>" + this.answers[section][index].c + "</p>"
                        )
                    )
                ).append(
                    $('<div class="score-example-wrapper">').append(
                        $('<a class="btn btn-info score-example-button" data-index="' + index + '" href="#">Show Example</a>').click(function(e){
                            e.preventDefault();
                            if ($(this).hasClass('shown')){
                                $(this).parent().find('.score-example').empty();
                                $(this).text('Show Example').removeClass('shown');
                            } else {
                                var container = $(this).parent().find('.score-example'),
                                    example = $(self.examples.find(question.example).clone());

                                container.empty().append(example)

                                $(this).text("Hide Example").addClass('shown')
                            }
                        })
                    ).append(
                        $('<div class="score-example">')
                    )
                ).append(
                    "<hr />"
                );

                if (!skipException && question.afterScore !== void 0 && typeof question.afterScore == 'function') {
                    question.afterScore(question, this.answers[section][index]);
                }
            }

            return true;
        }
    };

    Popup = function(options){
        this.options = {
            beforeLoad: function(){},
            afterLoad: function(){},
            beforeUnload: function(){},
            afterUnload: function(){}
        }

        if (options){
            for (var x in options){
                if (this.options[x] !== void 0){
                    this.options[x] = options[x]
                }
            }
        }
    }

    Popup.prototype.show = function(url){
        this.options.beforeLoad()

        var self = this;
        $("#popup_wrapper").fadeIn()
        $("#popup_mask").fadeTo(400, 0.7, function(){
            self.load(url)
            document.body.style.overflow = 'hidden'
            self.options.afterLoad();
        })

    }

    Popup.prototype.load = function(url){
        if (url){
            $("#popup_content").load(url, null, function(){
                $("#popup_content").css({height: $("#popup_content")[0].scrollHeight})
            })
        } else {
            $("#popup_content").css({height: $("#popup_content")[0].scrollHeight})
        }
    }

    Popup.prototype.hide = function(){
        this.options.beforeUnload();

        var self = this;
        $('#popup_mask').fadeOut()
        $("#popup_wrapper").fadeOut(400, function(){
            $("#popup_content").empty()
            $("#popup_content").css({height: 1})
            document.body.style.overflow = ''
            self.options.afterUnload();
        })
    }
})(jQuery)
